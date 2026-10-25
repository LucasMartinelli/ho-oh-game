#!/usr/bin/env python3
"""Build the local scenery atlas. Run from the repository root with Pillow.

Kenney Tiny Town (CC0) supplies the architecture and vegetation; Sharm's
Tiny 16 (CC-BY) supplies characters and animated fire. See CREDITS.md.
Coordinates refer to the PACKED sheets, in 16px cells. Multi-cell objects
must be assembled before scaling; transparent cells are never ground fills.
"""
import base64
import io
import json
from PIL import Image, ImageDraw

SRC = 'scripts/pixelart'
sheets = {k: Image.open(f'{SRC}/{name}.png').convert('RGBA') for k, name in [
    ('tt', 'kenney-tiny-town'), ('t16', 'tiny16-basictiles'), ('th', 'tiny16-things')]}
images, animations = {}, {}


def block(sheet, x, y, w=1, h=1):
    source = sheets[sheet]
    assert 0 <= x and 0 <= y and (x+w)*16 <= source.width and (y+h)*16 <= source.height
    return source.crop((x*16, y*16, (x+w)*16, (y+h)*16))


def up(image, scale=2):
    return image.resize((image.width*scale, image.height*scale), Image.Resampling.NEAREST)


def png(image):
    out = io.BytesIO()
    image.save(out, 'PNG', optimize=True)
    return 'data:image/png;base64,' + base64.b64encode(out.getvalue()).decode()


def emit(name, image, scale=1):
    images[name] = png(up(image, scale))


def tint(image, hue=0, sat=1, value=1):
    h, s, v = image.convert('HSV').split()
    h = h.point(lambda p: (p+round(hue/360*255)) % 256)
    s = s.point(lambda p: min(255, round(p*sat)))
    v = v.point(lambda p: min(255, round(p*value)))
    out = Image.merge('HSV', (h, s, v)).convert('RGB')
    out.putalpha(image.getchannel('A'))
    return out


def compose(w, h, parts):
    out = Image.new('RGBA', (w*16, h*16))
    for image, x, y in parts:
        out.alpha_composite(image, (x*16, y*16))
    return out


# Quiet, seamless ground with a shared value range. Detail is scattered by the
# world painter, rather than repeating a flower or a slab edge in every cell.
GROUND = [('#648b50', '#779b5b', '#557c46'), ('#578776', '#649280', '#4c796b'),
          ('#746958', '#817460', '#655e52'), ('#7b9390', '#8b9f96', '#6c8583')]
for region, (base, light, dark) in enumerate(GROUND):
    for variant in range(4):
        im = Image.new('RGBA', (16, 16), base)
        d = ImageDraw.Draw(im)
        if variant:
            x, y = [(3, 9), (11, 4), (7, 12)][variant-1]
            d.line((x, y, x+2, y), fill=dark)
            d.point((x+1, y-1), fill=light)
        emit(f'g{region}_{variant}', im)


def ground(name, base, light, dark, stone=False):
    im = Image.new('RGBA', (32, 32), base)
    d = ImageDraw.Draw(im)
    if stone:
        for y in range(0, 32, 8):
            d.line((0, y, 31, y), fill=dark)
            for x in range((y//8 % 2)*8, 32, 16):
                d.line((x, y, x, y+7), fill=dark)
                d.line((x+2, y+1, min(x+13, 31), y+1), fill=light)
    else:
        for x, y in [(3, 6), (21, 2), (13, 22), (27, 17), (4, 29)]:
            d.line((x, y, x+2, y), fill=light)
            d.point((x+1, y+1), fill=dark)
    emit(name, im)


ground('dirt', '#b5a078', '#c3ae83', '#a48e6b')
ground('sand', '#c7b88b', '#d4c59a', '#b6aa80')
ground('stone', '#89978c', '#a6b0a0', '#697d76', True)
ground('slab', '#a1ad9a', '#bac2a9', '#7d9083', True)
for name, base, light, dark in [('water', '#285666', '#3b7180', '#244e60'), ('water2', '#397a86', '#57979c', '#34717e')]:
    im = Image.new('RGBA', (64, 64), base)
    d = ImageDraw.Draw(im)
    for x, y in [(7, 9), (39, 27), (19, 49)]:
        d.line((x, y, x+7, y), fill=light)
        d.line((x+8, y-1, x+11, y-1), fill=light)
        d.line((x+2, y+2, x+9, y+2), fill=dark)
    emit(name, im)

# The 3x3 foliage section is an autotile set, NOT one large tree. Use only
# complete single crowns. A broadleaf reuses the round crown and the trunk of
# the complete cypress; both remain connected, with transparent padding.
TINTS = [(0, .82, .92), (18, .62, .86), (-24, .32, .70), (24, .40, .98)]
broadleaf = Image.new('RGBA', (32, 40))
trunk = block('tt', 4, 1).crop((5, 8, 11, 16))
broadleaf.alpha_composite(up(trunk, 2), (10, 24))
broadleaf.alpha_composite(up(block('tt', 5, 0), 2), (0, 0))
flora = {'tree-round': block('tt', 4, 0, 1, 2), 'tree-oak': broadleaf,
         'tree-pine': block('tt', 4, 0, 1, 2), 'tree-pine2': broadleaf,
         'tree-dead': block('tt', 3, 0, 1, 2), 'tree-dead2': broadleaf,
         'tree-mush': broadleaf, 'bush': block('tt', 4, 2),
         'mushroom': block('tt', 5, 2), 'sapling': block('tt', 5, 1)}
for name, source in flora.items():
    for region, tones in enumerate(TINTS):
        emit(f'{name}{region}', tint(source, *tones), 2 if source.width > 16 else 3)


# Transparent meadow stamps: the source tile's grass is removed so its flowers
# sit on any biome without a square patch of a different green.
flowers = block('tt', 2, 0)
for y in range(16):
    for x in range(16):
        r, g, b, a = flowers.getpixel((x, y))
        if g > r:
            flowers.putpixel((x, y), (0, 0, 0, 0))
for region in range(4):
    emit(f'ground-flower-{region}', tint(flowers, [0, 50, -15, 130][region], .22, .94))
    emit(f'ground-tuft-{region}', tint(block('tt', 5, 1), *TINTS[region]))
emit('ground-rubble', tint(block('t16', 2, 7), 0, .25, .85))

# Props: complete single tiles, or deliberately connected multi-cell pieces.
for name, x, y in [('sign', 11, 6), ('sign-red', 11, 7), ('well', 8, 8),
                   ('crate', 10, 8), ('pot', 11, 8), ('chest', 10, 10), ('fence', 9, 3)]:
    emit(name, block('tt', x, y), 2)
emit('bench', compose(3, 1, [(block('tt', 8, 6), 0, 0), (block('tt', 9, 6), 1, 0), (block('tt', 10, 6), 2, 0)]), 1)
# Warm trail lantern: glass, a bracket and a grounded timber post.
lantern = Image.new('RGBA', (16, 32))
d = ImageDraw.Draw(lantern)
d.rectangle((6, 11, 9, 30), fill='#4d443b')
d.line((7, 12, 7, 29), fill='#9d8358')
d.rectangle((4, 29, 11, 31), fill='#615d48')
d.rectangle((3, 4, 12, 14), fill='#414a42')
d.rectangle((5, 6, 10, 11), fill='#dbbb75')
d.rectangle((6, 7, 8, 10), fill='#f7e2a2')
d.line((3, 13, 12, 13), fill='#aa8b55')
d.polygon([(2, 4), (7, 1), (13, 4)], fill='#566459')
emit('torch', lantern, 2)
emit('wisp', block('t16', 5, 3), 2)

# Proper roofs (rows 4/5), facade (6/7), foundation (8). No floor/arch tiles
# substituted for walls. Regional color treatments keep one architectural family.
def house(region):
    roof = 4 if region in (0, 2) else 0
    wall = 0 if region in (0, 2) else 4
    parts = []
    for x in range(3):
        parts += [(block('tt', roof+x, 4), x, 0), (block('tt', roof+x, 5), x, 1)]
        parts += [(block('tt', wall+(1 if x == 1 else 0), 6), x, 2), (block('tt', wall+(1 if x == 1 else 0), 7), x, 3)]
    building = compose(3, 4, parts)
    # Pitched roof cut from the roof material, with stepped eaves and a chimney.
    roof_image = building.crop((0, 0, 48, 32))
    mask = Image.new('L', (48, 32))
    ImageDraw.Draw(mask).polygon([(12, 1), (35, 1), (47, 28), (47, 31), (0, 31), (0, 28)], fill=255)
    roof_image.putalpha(mask)
    building.paste((0, 0, 0, 0), (0, 0, 48, 32))
    building.alpha_composite(roof_image)
    d = ImageDraw.Draw(building)
    d.rectangle((0, 30, 47, 32), fill='#4b4141')
    d.line((2, 29, 45, 29), fill='#dac39a')
    d.rectangle((33, 0, 38, 9), fill='#655e59')
    d.rectangle((32, 0, 39, 2), fill='#aaa38a')
    return tint(building, *[(0,.72,.95),(10,.62,1),(-8,.55,.85),(18,.35,1.08)][region])


for region in range(4):
    emit(f'house-{region}', house(region), 2)

# One complete open arch, not four alternative arch tiles placed side by side.
arch = compose(2, 2, [(block('tt', 3, 8), 0, 0), (block('tt', 6, 8), 1, 0),
                      (block('tt', 5, 9), 0, 1), (block('tt', 6, 9), 1, 1)])
for region in range(4):
    emit(f'shrine-{region}', tint(arch, *[(0,.45,.94),(20,.4,1),(-15,.3,.76),(25,.25,1.08)][region]), 3)
emit('home-shrine', tint(arch, 0, .45, .94), 3)
# Short masonry posts have a cap, a shaft and a foot; no wall-edge fragments.
column = Image.new('RGBA', (16, 24))
column.alpha_composite(block('tt', 1, 9).crop((3, 0, 13, 16)), (3, 4))
d = ImageDraw.Draw(column)
d.rectangle((1, 1, 14, 4), fill='#a9b8b5')
d.line((1, 1, 14, 1), fill='#d3d8bb')
d.rectangle((2, 20, 13, 22), fill='#758a8a')
d.line((4, 5, 4, 19), fill='#bdc6b6')
emit('ruin-col', column, 2)
emit('basalt', tint(block('t16', 7, 7), 0, .18, .6), 3)

# Beacons remain distinct landmarks at the original gameplay coordinates.
emit('beacon-lantern', lantern, 3)
emit('beacon-root', tint(broadleaf, 0, .70, .90), 3)
emit('beacon-fountain', block('tt', 8, 8), 3)
emit('beacon-base', tint(block('t16', 7, 4), 0, .2, .8), 2)
emit('beacon-obelisk', compose(1, 3, [(block('t16', 7, 3), 0, 0), (block('t16', 7, 4), 0, 1), (block('t16', 7, 5), 0, 2)]), 2)
emit('beacon-star', arch, 2)
lighthouse = compose(2, 4, [(block('tt', 0, 9), 0, 2), (block('tt', 2, 9), 1, 2),
    (block('tt', 0, 10), 0, 3), (block('tt', 2, 10), 1, 3)])
d = ImageDraw.Draw(lighthouse)
d.polygon([(3, 16), (15, 7), (28, 16)], fill='#405b64')
d.line((3, 16, 28, 16), fill='#bbc5ab', width=2)
d.rectangle((7, 18, 24, 29), fill='#d2b573')
d.rectangle((10, 19, 21, 26), fill='#f1dfa2')
d.line((15, 18, 15, 29), fill='#5c6e70', width=2)
d.rectangle((5, 29, 26, 32), fill='#667f80')
emit('lighthouse', lighthouse, 2)



def frames(name, source_frames, scale):
    fw, fh = source_frames[0].size
    strip = Image.new('RGBA', (fw*len(source_frames), fh))
    for i, frame in enumerate(source_frames):
        strip.alpha_composite(frame, (i*fw, 0))
    animations[name] = {'data': png(up(strip, scale)), 'fw': fw*scale, 'fh': fh*scale, 'frames': len(source_frames)}


for name, row in [('fire', 8), ('icefire', 10), ('brazier', 8)]:
    frames(name, [block('th', x, row, 2, 2) for x in (0, 2, 4)], 1)
for i, row in enumerate([8, 9]):
    for direction, col in enumerate([0, 2, 4, 6]):
        frames(f'villager{i}-{direction}', [block('t16', col, row), block('t16', col+1, row)], 2)

emit('gate-bramble', compose(2, 2, [(tint(block('t16', 4, 11), 0, .65, .7), x, y) for x in range(2) for y in range(2)]), 2)
emit('gate-rock', tint(block('t16', 7, 7), 0, .25, .85), 4)
emit('gate-crystal', tint(block('t16', 7, 7), 140, .65, 1.15), 4)
emit('hz-spore', block('tt', 5, 2), 3)
emit('hz-current', tint(block('t16', 5, 3), 0, .6, 1), 2)
emit('hz-vent', tint(block('t16', 2, 7), 0, .5, .75), 3)
emit('hz-gust', tint(block('t16', 5, 3), 0, .2, 1.2), 2)

with open('src/scenery-data.json', 'w') as out:
    json.dump({'images': images, 'sheets': animations}, out)
print(f'{len(images)} images, {len(animations)} animations -> src/scenery-data.json')
