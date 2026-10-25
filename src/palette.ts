/** Mirror of the primitive tokens in tokens.css for canvas, SVG and Phaser. Keep both in sync. */
export const PALETTE={
 ink950:'#140d14',ink900:'#1e1520',ink800:'#2b1f2c',ink700:'#3d2d3c',ink600:'#5a4553',ink500:'#7a6170',ink400:'#9a8290',
 paper50:'#fffaf0',paper100:'#f7eed6',paper200:'#ecdcb8',paper300:'#d9c294',paper400:'#b39a6c',paper500:'#8c7452',paper600:'#6b5640',
 ember200:'#ffc09a',ember300:'#ff8a5c',ember400:'#ec5a36',ember500:'#c4362a',ember600:'#9a2526',ember700:'#651a22',
 gold100:'#fff4c2',gold200:'#ffe07a',gold300:'#f8c440',gold400:'#e0962a',gold500:'#a8661c',gold600:'#8a5012',
 leaf200:'#c8f0a0',leaf300:'#9ee070',leaf400:'#4cbc48',leaf500:'#2e8a3c',leaf600:'#22703a',leaf700:'#18502c',
 tide200:'#bfe6fb',tide300:'#68b8f0',tide400:'#3d8ad0',tide500:'#2a5ea8',tide700:'#1a3a6c',tide900:'#0f2038',
 gale200:'#ddd0fb',gale300:'#b8a0f0',gale500:'#6a4cb8',gale700:'#3c2a74'
} as const;

export const FONT={display:"'Pixelify Sans','Trebuchet MS',sans-serif",body:"'DotGothic16','Trebuchet MS',sans-serif",label:"'Silkscreen','Courier New',monospace"} as const;

/** Chapter colours, in REGIONS order: forest, tide, ash, sky. */
export const REGION_COLORS=[PALETTE.leaf400,PALETTE.tide300,PALETTE.ember400,PALETTE.gale300] as const;

/** Style preset for in-world Phaser labels (pending migration, see design-system.md). */
export const WORLD_TEXT={fontFamily:FONT.body,color:PALETTE.paper100,stroke:PALETTE.ink950,strokeThickness:4} as const;
