#!/usr/bin/env python3
"""Build src/scenery-data.json from pixel-art sources in scripts/pixelart/.

Sources (see CREDITS.md):
- kenney-tiny-town.png   Kenney "Tiny Town" tilemap_packed.png, CC0.
- tiny16-basictiles.png  Sharm / Lanea Zimmerman "Tiny 16: Basic", CC-BY/OGA-BY.
- tiny16-things.png      same pack.

Every entry is emitted as a data-URI PNG so the standalone build keeps working
without external files. `sheets` entries are horizontal strips for Phaser
spritesheets (frame animations); `images` are single sprites.
"""
import base64, io, json, sys
from PIL import Image

SRC = 'scripts/pixelart'
OUT = 'src/scenery-data.json'
T = 16

sheets = {
    'tt': Image.open(f'{SRC}/kenney-tiny-town.png').convert('RGBA'),
    't16': Image.open(f'{SRC}/tiny16-basictiles.png').convert('RGBA'),
    'th': Image.open(f'{SRC}/tiny16-things.png').convert('RGBA'),
}

def tile(sheet, c, r):
    return sheets[sheet].crop((c*T, r*T, c*T+T, r*T+T))

def block(sheet, c, r, w=1, h=1):
    return sheets[sheet].crop((c*T, r*T, (c+w)*T, (r+h)*T))

def tint(img, dh=0, sat=1.0, val=1.0):
    """Shift hue by dh degrees, scale saturation/value."""
    if dh == 0 and sat == 1.0 and val == 1.0:
        return img
    hsv = img.convert('HSV')
    h, s, v = hsv.split()
    if dh:
        h = h.point(lambda p: (p + round(dh/360*255)) % 256)
    if sat != 1.0:
        s = s.point(lambda p: max(0, min(255, round(p*sat))))
    if val != 1.0:
        v = v.point(lambda p: max(0, min(255, round(p*val))))
    out = Image.merge('HSV', (h, s, v)).convert('RGB')
    out.putalpha(img.getchannel('A'))
    return out

def up(img, k):
    return img.resize((img.width*k, img.height*k), Image.NEAREST)

def compose(w, h, parts, bg=None):
    """parts: list of (img, x, y) in tile units of 16px."""
    c = Image.new('RGBA', (w*T, h*T), bg or (0, 0, 0, 0))
    for img, x, y in parts:
        c.paste(img, (x*T, y*T), img)
    return c

def png64(img):
    b = io.BytesIO()
    img.save(b, 'PNG', optimize=True)
    return 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()

images = {}   # name -> data uri
anim = {}     # name -> {data, fw, fh, frames}
emit = lambda name, img: images.__setitem__(name, png64(img))

def emit_frames(name, frames, k=1):
    fw, fh = frames[0].width*k, frames[0].height*k
    strip = Image.new('RGBA', (fw*len(frames), fh), (0, 0, 0, 0))
    for i, f in enumerate(frames):
        strip.paste(up(f, k) if k != 1 else f, (i*fw, 0))
    anim[name] = {'data': png64(strip), 'fw': fw, 'fh': fh, 'frames': len(frames)}

# ---------------------------------------------------------------- terrain
# Per-region ground tiles (4 variants each). Kenney grass row 0 cols 0-2 +
# tiny16 daisy grass for accents.
GRASS_SRC = [tile('tt', 0, 0), tile('tt', 1, 0), tile('tt', 2, 0), tile('t16', 4, 1)]
REGION_TINT = [  # (hue_shift_deg, sat_mul, val_mul)
    (0,   1.00, 1.00),   # 0 emerald forest
    (28,  0.85, 0.92),   # 1 tides: cooler teal grass
    (-18, 0.42, 0.78),   # 2 ash valley: dry, desaturated
    (55,  0.35, 1.10),   # 3 sky ruins: pale lavender-mint
]
for reg, (dh, sat, val) in enumerate(REGION_TINT):
    for v, g in enumerate(GRASS_SRC):
        emit(f'g{reg}_{v}', tint(g, dh, sat, val))

# Path / dirt / stone / sand tiles (pattern + stamps)
emit('dirt',  tint(block('tt', 1, 1), 8, 0.9, 0.95))        # dirt interior
emit('dirt2', tint(block('tt', 0, 1), 8, 0.9, 0.95))        # dirt w/ grass edge top
emit('sand',  tint(tile('tt', 1, 2), -10, 0.7, 1.12))       # beach sand
emit('stone', tile('tt', 7, 3))                              # stone path tile
emit('slab',  tile('tt', 0, 9))                              # white slab
emit('slab2', tile('tt', 1, 9))
emit('water', tile('t16', 5, 1))                             # sea water tile
emit('water2', tile('t16', 5, 2))                            # animated water frame
emit('ash',   tint(tile('tt', 1, 0), -18, 0.35, 0.72))       # scorched ground
emit('brick', tile('tt', 6, 10))                             # stone brick block
emit('wood',  tile('tt', 9, 5))                              # wood plank
emit('pebble',tint(tile('tt', 7, 3), 0, 0.5, 0.9))

# ---------------------------------------------------------------- flora (upscaled display sprites)
def flora(name, img, k=4):
    for reg, (dh, sat, val) in enumerate(REGION_TINT):
        emit(f'{name}{reg}', up(tint(img, dh, sat, val), k))

# trees: kenney round/egg trees, conifers; tiny16 big oak (2x2), mushroom tree
flora('tree-round', tile('tt', 4, 1), 5)
flora('tree-egg',   tile('tt', 4, 2), 5)
flora('tree-autumn',tile('tt', 3, 1), 5)
flora('tree-pine',  block('tt', 6, 1, 2, 2), 3)
flora('tree-pine2', block('tt', 9, 1, 2, 2), 3)
flora('tree-slim',  block('tt', 11, 1, 1, 2), 4)
flora('tree-oak',   block('t16', 3, 13, 2, 2), 3)
flora('tree-mush',  tile('t16', 6, 3), 5)
flora('tree-dead',  tint(tile('tt', 3, 2), 0, 0.25, 0.6), 5)
flora('tree-dead2', tint(tile('tt', 3, 1), 0, 0.2, 0.5), 5)
flora('bush',    tile('tt', 8, 0), 4)
flora('mushroom',tile('tt', 5, 2), 4)
flora('sapling', tile('tt', 5, 1), 4)
flora('hay',     tile('tt', 9, 0), 4)
flora('hay2',    tile('tt', 10, 0), 4)
flora('rock',    tint(tile('tt', 10, 0), -10, 0.3, 0.8), 4)
flora('rock2',   tint(tile('tt', 11, 0), -10, 0.3, 0.75), 4)

# ---------------------------------------------------------------- props
emit('sign',    up(tile('tt', 11, 6), 3))          # wooden sign board
emit('sign-red',up(tile('tt', 11, 7), 3))          # red lantern post
emit('post',    up(tile('tt', 11, 5), 3))          # wood beam post
emit('post-sm', up(tile('tt', 11, 3), 3))          # short fence post
emit('well',    up(tile('tt', 8, 8), 3))
emit('tent',    up(tile('tt', 8, 7), 4))
emit('crate',   up(tile('tt', 10, 8), 3))          # barrel
emit('pot',     up(tile('tt', 11, 8), 3))          # pot with water
emit('box',     up(tile('th', 6, 9), 3))
emit('bench',   up(block('tt', 9, 6, 2, 1), 3))    # log bench
emit('halo',    up(tile('tt', 10, 7), 3))          # golden ring decor
emit('chest',   up(tile('tt', 10, 10), 3))
emit('chest-open', up(tile('tt', 11, 10), 3))
emit('pillar',  up(tile('tt', 4, 10), 3))          # gray column
emit('wall-ivy',up(tile('tt', 3, 9), 3))
emit('fence',   up(tile('tt', 9, 3), 3))           # fence rail
emit('torch',   up(tile('t16', 3, 7), 3))          # torch on post (lit)
emit('wisp',    up(tile('t16', 5, 3), 4))          # cyan magic wisps
emit('bones',   up(tile('t16', 6, 11), 3))
emit('bones2',  up(tile('t16', 7, 11), 3))
emit('roots',   up(tile('t16', 4, 5), 3))
emit('vase',    up(tile('t16', 3, 3), 3))

# animated flames: campfire (orange) and spirit fire (cyan), 3 frames each
emit_frames('fire', [tile('th', 1, 8), tile('th', 3, 8), tile('th', 5, 8)], 3)
emit_frames('icefire', [tile('th', 1, 10), tile('th', 3, 10), tile('th', 5, 10)], 3)
emit_frames('brazier', [tile('th', 0, 9), tile('th', 2, 9), tile('th', 4, 9)], 3)

# ---------------------------------------------------------------- gates
# bramble: dark thorny bush cluster; rock: boulder pile; crystal: magic stones
emit('gate-bramble', up(compose(2, 2, [
    (tint(tile('t16', 4, 11), -20, 0.5, 0.55), 0, 0),
    (tint(tile('t16', 4, 11), -20, 0.5, 0.55), 1, 0),
    (tint(tile('t16', 4, 11), -20, 0.4, 0.45), 0, 1),
    (tint(tile('t16', 4, 11), -20, 0.4, 0.45), 1, 1),
    (tile('t16', 4, 5), 0, 1),
]), 3))
emit('gate-rock', up(compose(2, 2, [
    (tint(tile('tt', 6, 10), 0, 0.7, 0.7), 0, 0),
    (tint(tile('tt', 11, 0), 0, 0.8, 0.75), 1, 0),
    (tint(tile('tt', 11, 0), 0, 0.8, 0.6), 0, 1),
    (tint(tile('tt', 6, 10), 0, 0.7, 0.55), 1, 1),
]), 3))
emit('gate-crystal', up(compose(2, 2, [
    (tile('tt', 6, 10), 0, 1),
    (tint(tile('tt', 11, 0), 160, 0.7, 1.1), 1, 1),
    (tile('th', 3, 10), 0, 0),
    (tile('th', 5, 10), 1, 0),
]), 3))

# ---------------------------------------------------------------- beacon monuments (per name)
# lantern post: kenney red lantern (11,7) is already a complete lamp on pole
emit('beacon-lantern', up(tile('tt', 11, 7), 4))
# fountain: well + water
emit('beacon-fountain', up(tile('tt', 8, 8), 4))
# brazier uses animated 'brazier' sheet + stone base
emit('beacon-base', up(tile('tt', 6, 10), 3))
# roots/runes for "Raiz Primordial": little sapling over roots
emit('beacon-root', up(compose(2, 2, [
    (tile('t16', 4, 5), 0, 1), (tile('t16', 4, 5), 1, 1),
    (tile('tt', 4, 2), 0, 0), (tile('tt', 5, 1), 1, 0),
]), 3))
# obelisk: stacked dark bricks + top stone
emit('beacon-obelisk', up(compose(1, 3, [
    (tint(tile('tt', 6, 10), 200, 0.6, 1.1), 0, 0),
    (tint(tile('tt', 6, 10), 200, 0.5, 0.85), 0, 1),
    (tint(tile('tt', 6, 10), 0, 0.6, 0.6), 0, 2),
]), 3))
# star lens: arch + wisp
emit('beacon-star', up(compose(2, 2, [
    (tile('tt', 3, 9), 0, 1), (tile('tt', 4, 9), 1, 1),
    (tile('t16', 5, 3), 0, 0),
]), 3))

# ---------------------------------------------------------------- structures
def layout(name, w, h, parts, k=3):
    emit(name, up(compose(w, h, parts), k))

# houses: 3w x 4h — roof row (gable top), walls w/ window+door
def house(roofc, wallc, name):
    r0, r1, r2, r3 = roofc, roofc, wallc, wallc
    # kenney rows: 3,5 = roof peak gray / 7,5 = roof peak orange? Actually gable = (3,5)/(7,5)
    layout(name, 3, 4, [
        (tile('tt', 3, 5) if roofc == 'gray' else tile('tt', 7, 5), 1, 0),
        (tile('tt', 0, 5) if roofc == 'gray' else tile('tt', 4, 5), 0, 1),
        (tile('tt', 1, 5) if roofc == 'gray' else tile('tt', 5, 5), 1, 1),
        (tile('tt', 2, 5) if roofc == 'gray' else tile('tt', 6, 5), 2, 1),
        (tile('tt', 0, 4) if wallc == 'gray' else tile('tt', 4, 4), 0, 2),
        (tile('tt', 1, 4) if wallc == 'gray' else tile('tt', 5, 4), 1, 2),
        (tile('tt', 2, 4) if wallc == 'gray' else tile('tt', 6, 4), 2, 2),
        (tile('tt', 1, 7) if wallc == 'gray' else tile('tt', 5, 7), 0, 3),
        (tile('tt', 2, 7) if wallc == 'gray' else tile('tt', 6, 7), 1, 3),
        (tile('tt', 3, 7) if wallc == 'gray' else tile('tt', 7, 7), 2, 3),
    ])
house('gray', 'gray', 'house-gray')
house('orange', 'orange', 'house-orange')

# shrines per region: 5x4 platform of slabs + monument + corner pillars
def shrine(name, slabt, cent, flames):
    parts = []
    for x in range(5):
        for y in range(4):
            if 0 < x < 4 and 0 < y < 3:
                parts.append((slabt, x, y))
    # border pillars
    for x, y in [(0, 0), (4, 0), (0, 3), (4, 3)]:
        parts.append((tile('tt', 3, 10), x, y))
    parts.append((cent, 2, 1))
    for x in (0, 2):
        for fx in (1, 3):
            parts.append((flames, fx, x))
    layout(name, 5, 4, parts)

shrine('shrine-0', tile('tt', 7, 3), tile('tt', 4, 1), tile('th', 0, 9))
shrine('shrine-1', tint(tile('tt', 7, 3), 190, 0.6, 1.05), tile('tt', 8, 8), tile('th', 0, 11))
shrine('shrine-2', tint(tile('tt', 6, 10), 0, 0.7, 0.6), tint(tile('tt', 3, 10), 0, 0.6, 0.5), tile('th', 2, 9))
shrine('shrine-3', tint(tile('tt', 0, 9), 220, 0.7, 1.05), block('tt', 3, 9, 2, 1), tile('th', 0, 11))

# home sanctuary: little plaza + hut + arch
layout('home-shrine', 6, 5, [
    (tile('tt', 0, 9), 1, 2), (tile('tt', 1, 9), 2, 2), (tile('tt', 0, 9), 3, 2),
    (tile('tt', 1, 9), 1, 3), (tile('tt', 0, 9), 2, 3), (tile('tt', 1, 9), 3, 3),
    (tile('tt', 2, 9), 4, 3),
    (tile('tt', 3, 9), 2, 0), (tile('tt', 4, 9), 3, 0),  # arch
    (tile('t16', 3, 7), 0, 2), (tile('t16', 3, 7), 5, 2),  # torches
    (tile('tt', 7, 9), 0, 4), (tile('tt', 11, 6), 5, 4),   # signs
    (tile('tt', 4, 1), 1, 1),  # small tree
])

# gate arch (castle ivy arch) for sky region entry points
layout('arch', 4, 2, [
    (tile('tt', 3, 9), 0, 0), (tile('tt', 4, 9), 1, 0), (tile('tt', 5, 9), 2, 0), (tile('tt', 6, 9), 3, 0),
    (tile('tt', 3, 10), 0, 1), (tile('tt', 6, 10), 3, 1),
], 3)

# lighthouse: stacked column + lamp room + flame
layout('lighthouse', 2, 4, [
    (tint(tile('tt', 0, 8), 0, 0.5, 1.15), 0, 1), (tint(tile('tt', 1, 8), 0, 0.5, 1.15), 1, 1),
    (tint(tile('tt', 0, 8), 0, 0.5, 1.15), 0, 2), (tint(tile('tt', 1, 8), 0, 0.5, 1.15), 1, 2),
    (tint(tile('tt', 0, 8), 10, 0.8, 0.9), 0, 3), (tint(tile('tt', 1, 8), 10, 0.8, 0.9), 1, 3),
    (tile('t16', 3, 7), 0, 0), (tile('tt', 6, 10), 1, 0),
], 3)

# ruin column (sky region decor)
layout('ruin-col', 1, 3, [
    (tint(tile('tt', 3, 10), 220, 0.6, 1.08), 0, 0),
    (tint(tile('tt', 3, 10), 220, 0.6, 1.0), 0, 1),
    (tint(tile('tt', 6, 10), 220, 0.6, 0.9), 0, 2),
], 3)
# basalt spire (ash region decor)
layout('basalt', 2, 3, [
    (tint(tile('tt', 6, 10), 0, 0.5, 0.5), 0, 0),
    (tint(tile('tt', 6, 10), 0, 0.5, 0.45), 0, 1), (tint(tile('tt', 6, 10), 0, 0.5, 0.55), 1, 1),
    (tint(tile('tt', 6, 10), 0, 0.5, 0.6), 0, 2), (tint(tile('tt', 6, 10), 0, 0.5, 0.5), 1, 2),
], 3)

# bridge plank span piece (terrain stamp)
emit('plank', tile('tt', 9, 5))

# ---------------------------------------------------------------- villagers (ambient NPCs, 2-frame walk)
# basictiles rows 8-9: villager A (blond), villager B (brown hair)
for i, row in enumerate([8, 9]):
    for d, (c0, c1) in enumerate([(0, 1), (2, 3), (4, 5), (6, 7)]):
        emit_frames(f'villager{i}-{d}', [tile('t16', c0, row), tile('t16', c1, row)], 3)

# ---------------------------------------------------------------- hazard spots
emit('hz-spore',   up(compose(2, 1, [(tile('tt', 5, 2), 0, 0), (tint(tile('t16', 4, 2), 60, 0.9, 1.0), 1, 0)]), 3))
emit('hz-current', up(tint(tile('t16', 5, 2), 195, 1.1, 1.05), 3))
emit('hz-vent',    up(compose(2, 1, [(tint(tile('t16', 2, 7), 0, 0.6, 0.6), 0, 0), (tile('th', 5, 8), 1, 0)]), 3))
emit('hz-gust',    up(tint(tile('t16', 5, 3), 140, 0.5, 1.1), 3))

out = {'images': images, 'sheets': anim}
with open(OUT, 'w') as f:
    json.dump(out, f)
print(f'{len(images)} images, {len(anim)} sheets -> {OUT}')
