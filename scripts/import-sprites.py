import base64, io, json, urllib.request
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parent.parent
sha=json.loads((root/'public/sprites/sources.json').read_text())['commit']
base=f'https://raw.githubusercontent.com/PokeAPI/sprites/{sha}/'
ids={'hooh':250,'lugia':249,'caterpie':10,'rattata':19,'pidgey':16,'zubat':41,'bulbasaur':1,'squirtle':7,'charizard':6,'blastoise':9,'venusaur':3,'dragonite':149,'hooh-back':250}
result={};credits=[]
for name,id in ids.items():
 path=f'sprites/pokemon/versions/generation-v/black-white/animated/{"back/" if name.endswith("-back") else ""}{id}.gif'
 raw=urllib.request.urlopen(base+path,timeout=30).read()
 (root/'public/sprites'/f'{name}.gif').write_bytes(raw)
 im=Image.open(io.BytesIO(raw));n=im.n_frames;indices=list(range(n)) if n<=24 else [round(i*(n-1)/23) for i in range(24)]
 frames=[];total=0
 for i in range(n):
  im.seek(i);total+=im.info.get('duration',100)
  if i in indices:frames.append(im.convert('RGBA').copy())
 size=max(128,im.width,im.height);sheet=Image.new('RGBA',(size*len(frames),size))
 for i,f in enumerate(frames):sheet.alpha_composite(f,(size*i+(size-f.width)//2,(size-f.height)//2))
 out=io.BytesIO();sheet.save(out,format='PNG',optimize=True)
 first=io.BytesIO();frames[0].save(first,format='PNG')
 result[name]={'data':'data:image/png;base64,'+base64.b64encode(out.getvalue()).decode(),'poster':'data:image/png;base64,'+base64.b64encode(first.getvalue()).decode(),'size':size,'frames':len(frames),'fps':len(frames)/max(total/1000,.1)}
 credits.append({'name':name,'source':base+path,'frames':n,'usedFrames':len(frames)})
 print(name,n,'frames ->',len(frames))
(root/'src/sprite-data.json').write_text(json.dumps(result,separators=(',',':')))
(root/'public/sprites/sources.json').write_text(json.dumps({'repository':'https://github.com/PokeAPI/sprites','commit':sha,'assets':credits},indent=2))
(root/'public/sprites/LICENCE.txt').write_bytes(urllib.request.urlopen(base+'LICENCE.txt').read())
