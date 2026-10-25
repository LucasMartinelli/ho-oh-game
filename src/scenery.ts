import Phaser from 'phaser';
export const TREE_PALETTES=[['#193d2a','#2b5032','#3c633a','#557d43','#789653','#b3bc78'],['#193e38','#285b4c','#39705c','#558c73','#7fac92','#c2d3ad'],['#443b2d','#5d5134','#79663d','#94834f','#b7a565','#ddd099'],['#2d3d42','#425457','#526d6d','#6f8980','#91a69a','#c3cfb6']];
export function seeded(seed:number){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}}
export function makeScenery(scene:Phaser.Scene){
 for(let region=0;region<4;region++)for(let variant=0;variant<4;variant++){
  const texture=scene.textures.createCanvas(`tree-${region}-${variant}`,80,96)!,c=texture.context,random=seeded(250+region*999+variant*71),pal=TREE_PALETTES[region];
  // Root silhouette, bark, forks and leaf clusters are separate value groups.
  c.fillStyle='#273729';c.beginPath();c.moveTo(35,54);c.lineTo(34,84);c.lineTo(22,92);c.lineTo(39,88);c.lineTo(55,92);c.lineTo(46,83);c.lineTo(45,52);c.fill();
  c.fillStyle='#6c5740';c.fillRect(36,51,9,34);c.fillStyle='#a68b5b';c.fillRect(37,56,3,28);c.fillStyle='#443d2c';c.fillRect(42,59,2,22);c.fillStyle='#697145';c.fillRect(34,77,5,5);
  for(const [cx,cy,rx,ry] of [[24,47,21,19],[55,48,20,19],[41,25,25,23],[18,30,15,17],[61,29,16,16]] as number[][]){
   c.beginPath();for(let i=0;i<20;i++){const a=i*Math.PI/10,r=.85+random()*.18,x=Math.round(cx+Math.cos(a)*rx*r),y=Math.round(cy+Math.sin(a)*ry*r);i?c.lineTo(x,y):c.moveTo(x,y)}c.closePath();c.fillStyle=pal[0];c.fill();
   c.fillStyle=pal[1];c.beginPath();c.ellipse(cx-1,cy-3,rx-2,ry-3,0,0,6.28);c.fill();
   for(let i=0;i<95;i++){const a=random()*6.28,r=Math.sqrt(random()),x=Math.round(cx+Math.cos(a)*r*(rx-3)),y=Math.round(cy+Math.sin(a)*r*(ry-4));const light=(1-r)*1.2+(cx-x)/(rx*2)+(cy-y)/(ry*2);c.fillStyle=pal[Math.max(1,Math.min(5,Math.floor(2+light*1.6+random())))];const size=2+Math.floor(random()*3);c.fillRect(x,y,size,2);c.fillRect(x-1,y+1,size,2)}
  }
  // Fine rim highlights follow the upper-left light rather than a flat outline.
  for(let i=0;i<22;i++){c.fillStyle=pal[4];const x=23+random()*24,y=5+random()*8;c.fillRect(x|0,y|0,2,1)}
  texture.refresh();
 }
 const feather=scene.textures.createCanvas('gold-feather',20,32)!,f=feather.context;f.fillStyle='#ba8b43';f.beginPath();f.moveTo(4,29);f.lineTo(7,9);f.lineTo(16,2);f.lineTo(15,18);f.fill();f.fillStyle='#f6d782';f.beginPath();f.moveTo(5,26);f.lineTo(8,10);f.lineTo(15,3);f.lineTo(12,18);f.fill();f.strokeStyle='#fff2b6';f.beginPath();f.moveTo(4,30);f.lineTo(13,6);f.stroke();feather.refresh();
}
