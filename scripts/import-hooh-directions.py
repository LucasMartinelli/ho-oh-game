"""Import pinned, unmodified PMD sheets and their authored frame attachment points.
Requires Pillow. Re-run offline from the checked-in originals (no network).
"""
import base64, json, xml.etree.ElementTree as ET
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parent.parent
SOURCE=ROOT/'public/sprites/hooh-directions'
xml=ET.parse(SOURCE/'AnimData.xml')
result={}
for name in ['Idle','Walk','Shoot']:
    node=next(a for a in xml.findall('./Anims/Anim') if a.findtext('Name')==name)
    width,height=int(node.findtext('FrameWidth')),int(node.findtext('FrameHeight'))
    durations=[int(d.text)/60 for d in node.findall('./Durations/Duration')]
    count=len(durations)
    offsets=Image.open(SOURCE/f'{name}-Offsets.png').convert('RGBA')
    sheet=Image.open(SOURCE/f'{name}-Anim.png')
    assert sheet.size==offsets.size==(width*count,height*8)
    points=[]
    for direction in range(8):
        row=[]
        for frame in range(count):
            tile=offsets.crop((frame*width,direction*height,(frame+1)*width,(direction+1)*height))
            center=head=None
            for y in range(height):
                for x in range(width):
                    color=tile.getpixel((x,y))
                    if color==(0,255,0,255):center=[x,y]
                    if color==(0,0,0,255):head=[x,y]
            assert center is not None and head is not None,(name,direction,frame)
            row.append({'center':center,'mouth':head})
        points.append(row)
    # Continuous flame uses the sustained open-beak part, without a startup delay.
    sequence=list(range(11,18)) if name=='Shoot' else list(range(count))
    result[name]={'width':width,'height':height,'frames':count,'durations':durations,'sequence':sequence,'points':points,
        'data':'data:image/png;base64,'+base64.b64encode((SOURCE/f'{name}-Anim.png').read_bytes()).decode()}
(ROOT/'src/hooh-data.json').write_text(json.dumps(result,separators=(',',':'))+'\n')
print('Imported Idle/Walk/Shoot: 8 directions, original pixels and frame timings.')
