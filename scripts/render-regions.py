"""Original regional orchestral scores. Requires numpy and macOS afconvert.
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

# Distinct harmony, melody, tempo and instrumentation for each chapter.
settings=[
 ('Bosque Esmeralda',88,[(38,[62,65,69]),(34,[62,65,70]),(41,[60,65,69]),(33,[61,64,69])],[[74,77,79,76],[77,81,79,74],[72,76,77,81],[73,76,81,73]]),
 ('Lago das Marés',76,[(36,[60,64,67]),(33,[60,64,69]),(41,[60,65,69]),(43,[59,62,67])],[[79,76,74,72],[76,81,79,76],[77,76,72,69],[74,71,67,71]]),
 ('Vale das Cinzas',104,[(40,[59,64,67]),(36,[60,64,67]),(45,[60,64,69]),(35,[59,63,66])],[[64,67,71,69],[67,72,71,67],[69,72,76,72],[66,63,59,63]]),
 ('Ruínas do Céu',68,[(45,[60,64,69]),(41,[60,65,69]),(38,[62,65,69]),(40,[59,64,68])],[[81,76,79,81],[77,81,84,81],[81,77,74,77],[80,76,71,76]])]
regions=[];metrics=[]
for region,(title,bpm,chords,melodies) in enumerate(settings):
 BEAT=60/bpm;N=round(64*BEAT*SR);stems=[np.zeros((N,2),np.float32),np.zeros((N,2),np.float32)]
 for bar in range(16):
  phrase=(bar//2)%4;root,chord=chords[phrase];b=bar*4
  if bar%2==0:
   note(0,'cello',root,b,7.8,.42,.25)
   for j,n in enumerate(chord):note(0,'strings',n,b+j*.04,7.8,.23 if region==1 else .32,-.35+j*.3)
  if region==0:
   for j in range(4):note(0,'harp',chord[j%3]+(12 if j==3 else 0),b+j,1.8,.23,-.4)
   if bar%2==0:
    for j,n in enumerate(melodies[phrase]):note(0,'flute',n,b+j*2,1.8,.33,.15)
  elif region==1:
   for j in range(8):note(0,'harp',(chord+[chord[0]+12,chord[2]+12,chord[1]+12])[j%6],b+j*.5,2,.34,-.3)
   if bar%2==0:
    for j,n in enumerate(melodies[phrase]):note(0,'flute',n,b+j*2,1.6,.18,.35)
  elif region==2:
   for j in range(8):note(0,'pizz',root+12+(7 if j%4==3 else 0),b+j*.5,.4,.33,-.15)
   if bar%2==0:
    for j,n in enumerate(melodies[phrase]):note(0,'horn',n,b+j*2,1.6,.39,.25)
   note(0,'drum',36,b,1,.2);note(0,'timpani',root,b+2.5,1.2,.18)
  else:
   if bar%2==0:
    note(0,'horn',chord[0]-12,b,6,.22,.3)
    for j,n in enumerate(melodies[phrase]):note(0,'flute',n,b+j*2,1.8,.23,-.2)
   for j in range(2):note(0,'harp',chord[j]+12,b+j*2,3,.22,.4)
  for j in range(8):note(1,'pizz',root+(12 if j%4==3 else 0),b+j*.5,.4,.29 if j%2==0 else .19,.1)
  if bar%2==0:note(1,'horn',chord[0],b,3.2,.25,.3)
  note(1,'drum',36,b,1.1,.23);note(1,'timpani',root,b+2,1.5,.21,-.2)
  if bar%4==3:
   for j in range(3):note(1,'timpani',root,b+3+j*.25,.4,.14+j*.03)
 for stem in stems:
  dry=stem.copy()
  for delay,gain in [(.071,.12),(.113,.10),(.197,.085),(.313,.07),(.487,.05),(.719,.035),(.991,.02)]:stem+=np.roll(dry[:,::-1],int(delay*SR),axis=0)*gain
  stem-=stem.mean(axis=0)
 peak=max(np.max(np.abs(stems[0]+stems[1])),np.max(np.abs(stems[0])));scale=.78/peak
 entry={'title':title,'bpm':bpm,'duration':N/SR};stat={'title':title,'duration':N/SR}
 for name,stem in zip(['exploration','combat'],stems):
  stem*=scale;wav=R/f'region-{region}-{name}.wav';aac=wav.with_suffix('.m4a')
  with wave.open(str(wav),'wb') as f:f.setnchannels(2);f.setsampwidth(2);f.setframerate(SR);f.writeframes((np.clip(stem,-1,1)*32767).astype('<i2').tobytes())
  subprocess.run(['afconvert','-f','m4af','-d','aac ','-b','112000',str(wav),str(aac)],check=True)
  entry[name]=base64.b64encode(aac.read_bytes()).decode();stat[name]={'peak':float(np.max(np.abs(stem))),'rms':float(np.sqrt(np.mean(stem**2))),'bytes':aac.stat().st_size}
 regions.append(entry);metrics.append(stat);print(stat,flush=True)
(OUT/'src/orchestra-data.json').write_text(json.dumps({'regions':regions},separators=(',',':')))
(OUT/'scripts/orchestra-metrics.json').write_text(json.dumps(metrics,indent=2))
