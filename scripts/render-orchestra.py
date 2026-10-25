"""Original 32-bar, 88 BPM orchestral score. Requires numpy and macOS afconvert.
Download files listed in orchestra-sources.json from its pinned VSCO repository
into the directory passed as argv[1]. Output: embedded AAC stems, no runtime CDN.
"""
import numpy as np, wave, pathlib, subprocess, json, base64, sys
R=pathlib.Path(sys.argv[1]);OUT=pathlib.Path(__file__).resolve().parents[1];SR=32000;BEAT=60/88;N=round(128*BEAT*SR)
rng=np.random.default_rng(250);bank={}
roots={'strings-C4':72,'strings-A2':57,'strings-A3':69,'cello-C1':36,'cello-G1':43,'cello-C3':60,'harp-C3':48,'harp-G3':55,'harp-C5':72,'horn-C3':60,'horn-F2':53,'flute-C4':72,'flute-A3':69,'pizz-C1':36,'pizz-C3':60,'drum-C2':36,'timpani-C2':42}
for name,midi in roots.items():
 f=R/(name+'.wav');pcm=R/(name+'-pcm.wav');subprocess.run(['afconvert','-f','WAVE','-d','LEI16',str(f),str(pcm)],check=True)
 with wave.open(str(pcm)) as w:
  sr=w.getframerate();a=np.frombuffer(w.readframes(w.getnframes()),'<i2').astype(np.float32).reshape(-1,w.getnchannels()).mean(axis=1)/32768
 # Remove recording lead-in only, preserving attacks and acoustic timbre.
 energy=np.convolve(np.abs(a),np.ones(128)/128,'same');nz=np.flatnonzero(energy>energy.max()*.025);a=a[max(0,nz[0]-int(sr*.015)):]
 a=a/max(.002,np.sqrt(np.mean(a[:min(len(a),sr*3)]**2)))*.14
 bank.setdefault(name.split('-')[0],[]).append((midi,a,sr))
stems=[np.zeros((N,2),np.float32),np.zeros((N,2),np.float32)]
def note(stem,kind,midi,beat,duration,vol,pan=0):
 root,a,sr=min(bank[kind],key=lambda v:abs(v[0]-midi));rate=sr/SR*2**((midi-root)/12)
 length=min(int((duration*BEAT+.35)*SR),int((len(a)-1)/rate));x=np.interp(np.arange(length)*rate,np.arange(len(a)),a).astype(np.float32)
 attack=min(length//2,int(SR*(.16 if kind in ['strings','cello'] else .012)));release=min(length//2,int(SR*(.32 if kind in ['strings','cello','horn','flute'] else .12)))
 x[:attack]*=np.linspace(0,1,attack);x[-release:]*=np.linspace(1,0,release)
 x*=vol*(.96+rng.random()*.08)
 stereo=x[:,None]*np.array([np.sqrt((1-pan)/2),np.sqrt((1+pan)/2)])
 start=round(beat*BEAT*SR)%N;end=min(N,start+length);stems[stem][start:end]+=stereo[:end-start]
 if end-start<length:stems[stem][:length-(end-start)]+=stereo[end-start:]
# Two-bar harmony; final dominant resolves into first bar when looping.
chords=[(38,[62,65,69]),(34,[62,65,70]),(41,[60,65,69]),(36,[60,64,67]),(43,[62,67,70]),(38,[62,65,69]),(34,[62,65,70]),(33,[61,64,69])]
melodies=[[74,77,76,74],[77,81,79,77],[76,77,81,79],[76,72,74,76],[79,82,81,79],[77,76,74,69],[70,74,77,76],[73,76,81,73]]
for bar in range(32):
 phrase=(bar//2)%8;root,chord=chords[phrase];b=bar*4;swelling=.75+.25*np.sin(np.pi*(bar%16)/16)
 if bar%2==0:
  note(0,'cello',root,b,7.8,.48,.28)
  for i,n in enumerate(chord):note(0,'strings',n,b+i*.035,7.8,.30*swelling,-.3+i*.22)
 for j in range(8):note(0,'harp',(chord+[chord[0]+12])[j%4],b+j*.5,1.7,.16 if j%2 else .22,-.42)
 if bar%2==0:
  for j,n in enumerate(melodies[phrase]):note(0,'flute',n,b+[0,2.5,4,6][j],[2.2,1.3,1.8,1.7][j],.30 if bar<16 else .24,.18)
 if bar%4==2:
  note(0,'horn',chord[0]-12,b,2.8,.20,.38);note(0,'horn',chord[2]-12,b+2.8,3.8,.20,.38)
 # Combat ostinato, acoustic brass and bass percussion, locked to same timeline.
 for j in range(8):note(1,'pizz',root+(12 if j%4==3 else 0),b+j*.5,.4,.37 if j%2==0 else .24,.1)
 if bar%2==0:
  note(1,'horn',chord[0],b,2.7,.28,.25);note(1,'horn',chord[2]-12,b+3,3.6,.25,.4)
 note(1,'drum',36,b,1.1,.25,0);note(1,'timpani',root,b+2,1.6,.21,-.2)
 if bar%4==3:
  for j in range(3):note(1,'timpani',root,b+3+j*.25,.5,.13+j*.045,-.2)
# Circular multi-tap room reflections: no cut reverb at loop boundary.
for s in stems:
 dry=s.copy()
 for delay,gain in [(.071,.12),(.113,.10),(.197,.085),(.313,.07),(.487,.05),(.719,.035),(.991,.02)]:s+=np.roll(dry[:,::-1],int(delay*SR),axis=0)*gain
 s-=s.mean(axis=0)
peak=max(np.max(np.abs(stems[0]+stems[1])),np.max(np.abs(stems[0])));scale=.82/peak
encoded={};stats={}
for name,s in zip(['exploration','combat'],stems):
 s*=scale;wav=R/(name+'.wav');aac=R/(name+'.m4a')
 with wave.open(str(wav),'wb') as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((np.clip(s,-1,1)*32767).astype('<i2').tobytes())
 subprocess.run(['afconvert','-f','m4af','-d','aac ','-b','128000',str(wav),str(aac)],check=True)
 encoded[name]=base64.b64encode(aac.read_bytes()).decode();stats[name]={'peak':float(np.max(np.abs(s))),'rms':float(np.sqrt(np.mean(s*s))),'seconds':N/SR,'bytes':aac.stat().st_size}
encoded['duration']=N/SR
(OUT/'src/orchestra-data.json').write_text(json.dumps(encoded,separators=(',',':')))
(OUT/'scripts/orchestra-metrics.json').write_text(json.dumps(stats,indent=2));print(stats)
