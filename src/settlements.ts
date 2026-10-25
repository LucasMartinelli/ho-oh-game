import Phaser from 'phaser';
import {CAMPS,REGIONS} from './adventure';
import {TerrainPainter} from './terrain';

type Point=readonly [number,number];
interface SettlementLayout {house:Point;annex?:Point;well?:Point;bench:Point;fire:Point;sign:Point;garden:Point}
/** Shared foot positions for artwork, paving, firelight and ambient pedestrians.
 * These are decorative: world-revision-3 collision geometry stays untouched.
 */
export const SETTLEMENT_LAYOUTS:readonly SettlementLayout[]=[
 {house:[-104,-26],annex:[104,-26],bench:[64,64],fire:[0,24],sign:[-66,58],garden:[-106,44]},
 {house:[-72,-24],well:[66,-6],bench:[50,60],fire:[-6,14],sign:[-62,58],garden:[-102,28]},
 {house:[-70,-28],well:[52,10],bench:[24,68],fire:[-18,16],sign:[-62,56],garden:[-102,26]},
 {house:[-64,-24],well:[66,-8],bench:[46,62],fire:[-10,14],sign:[-60,58],garden:[-98,28]},
 {house:[68,-30],well:[-64,-8],bench:[-40,62],fire:[12,16],sign:[62,56],garden:[102,26]},
];

export function paintSettlements(scene:Phaser.Scene,c:TerrainPainter,obstacles:{x:number;y:number;r:number}[]){
 const sand=c.pattern(scene,'scn-sand'),slab=c.pattern(scene,'scn-slab');
 for(const [i,p] of CAMPS.entries()){
  const plan=SETTLEMENT_LAYOUTS[i],x=p.x/2,y=p.y/2,hw=i===0?82:64;
  c.save();
  // Chamfered edges blend into the clearing. Leave grass around existing trunks
  // and ponds instead of paving over them or moving saved collision geometry.
  c.beginPath();[[x-hw+10,y-32],...(i===0?[[x-26,y-32],[x-26,y-61],[x+26,y-61],[x+26,y-32]]:[]),[x+hw-10,y-32],[x+hw,y-22],[x+hw,y+28],[x+hw-14,y+42],[x-hw+14,y+42],[x-hw,y+28],[x-hw,y-22]].forEach(([px,py],j)=>j?c.lineTo(px,py):c.moveTo(px,py));c.closePath();c.clip();
  c.beginPath();c.moveTo(x-hw-1,y-70);c.lineTo(x+hw+1,y-70);c.lineTo(x+hw+1,y+50);c.lineTo(x-hw-1,y+50);c.closePath();
  for(const o of obstacles)if(Math.hypot(o.x-p.x,o.y-p.y)<260){c.moveTo(o.x/2+(o.r+10)/2,o.y/2);c.arc(o.x/2,o.y/2,(o.r+10)/2,0,Math.PI*2)}
  c.clip('evenodd');c.fillStyle=i===3?c.pattern(scene,'scn-cinder'):i===4?c.pattern(scene,'scn-marble'):sand;c.fillRect(x-hw,y-62,hw*2,106);
  const paving=i===2?c.pattern(scene,'scn-timber'):i===3?c.pattern(scene,'scn-cinder'):i===4?c.pattern(scene,'scn-marble'):slab;
  c.fillStyle=paving;c.fillRect(x-27,y-(i===0?60:26),54,i===0?94:60);
  // Each entrance leads to the shared path; courtyard furnishings have footings.
  for(const pos of [plan.house,plan.annex,plan.well,plan.bench].filter((v):v is Point=>!!v)){
   const px=x+pos[0]/2,py=y+pos[1]/2;
   c.strokeStyle=paving;c.lineWidth=12;c.lineCap='square';c.beginPath();c.moveTo(px,py+3);c.lineTo(px,y+8);c.lineTo(x,y+8);c.stroke();
  }
  for(const [hx,hy] of [plan.house,plan.annex].filter((v):v is Point=>!!v)){
   c.fillStyle='#354a3b40';c.fillRect(x+hx/2-22,y+hy/2-4,48,9);
   c.fillStyle='#c1baa0';c.fillRect(x+hx/2-7,y+hy/2+1,14,3);
  }
  const [gx,gy]=plan.garden;
  c.fillStyle='#56664b';c.fillRect(x+gx/2-9,y+gy/2-5,18,12);
  c.fillStyle='#aab28c';c.fillRect(x+gx/2-10,y+gy/2+7,20,2);
  for(let k=0;k<4;k++){const xx=x+gx/2-7+k*4;c.fillStyle='#7f9c5f';c.fillRect(xx,y+gy/2-2,2,7);c.fillStyle=i===2?'#d4dfca':'#dbc796';c.fillRect(xx,y+gy/2-2,2,2)}
  // A restrained stone fire ring, exactly below the animated brazier.
  const [fx,fy]=plan.fire;c.fillStyle='#6f7564';c.beginPath();c.ellipse(x+fx/2,y+fy/2+6,10,6,0,0,Math.PI*2);c.fill();
  c.restore();
 }
 // Compact sanctuary terraces with a quiet central mosaic and three front steps.
 for(const [i,p] of REGIONS.entries()){
  const x=p.x/2,y=p.y/2;
  c.fillStyle='#3c565045';c.fillRect(x-49,y-50,102,94);
  c.fillStyle=['#a7b396','#a2b8ad','#9b9684','#bbc3b2'][i];c.fillRect(x-51,y-54,102,92);
  c.fillStyle=i===1?c.pattern(scene,'scn-timber'):i===2?c.pattern(scene,'scn-cinder'):i===3?c.pattern(scene,'scn-marble'):slab;c.fillRect(x-48,y-51,96,86);
  c.fillStyle=['#8fa481','#86a8a4','#8e8775','#a0b3b0'][i];c.fillRect(x-26,y-24,52,48);
  // Regional inlays establish a focal point while keeping the arena readable.
  c.strokeStyle=['#bdc497','#c5d4bf','#c5aa7a','#dbe1c6'][i];c.lineWidth=2;c.beginPath();
  if(i===0){c.ellipse(x,y,15,19,0,0,Math.PI*2)}else if(i===1){for(let k=-1;k<=1;k++){c.moveTo(x-18,y+k*9);c.lineTo(x+18,y+k*9)}}else{c.moveTo(x,y-18);c.lineTo(x+18,y);c.lineTo(x,y+18);c.lineTo(x-18,y);c.closePath()}c.stroke();
  for(let k=0;k<3;k++){c.fillStyle=k%2?'#7f9386':'#bdc5ad';c.fillRect(x-23-k*3,y+38+k*3,46+k*6,3)}
 }
}
