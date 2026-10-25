import {TerrainPainter} from './terrain';
import {seeded} from './scenery';
import type {World} from './world';

/** Cosmetic dressing uses its own stream; collision and saved routes never change. */
export function paintBiomes(c:TerrainPainter,world:World){
 const random=seeded(621908);
 for(const tree of world.trees){
  const x=Math.round(tree.x/2),y=Math.round(tree.y/2),region=world.regionAt(tree.x,tree.y);
  // Understory follows existing trunks, leaving the open combat clearings quiet.
  for(let k=0;k<5;k++){
   const a=random()*Math.PI*2,d=9+random()*19,px=Math.round(x+Math.cos(a)*d),py=Math.round(y+Math.sin(a)*d*.6);
   if(world.paths.some(([ax,ay,bx,by])=>world.distanceSegment(px*2,py*2,ax,ay,bx,by)<48))continue;
   c.fillStyle=['#496b4138','#3d716638','#4e4c4438','#627f7838'][region];c.fillRect(px-4,py,9,3);
   if(region===0){
    c.strokeStyle='#6c6848';c.lineWidth=2;c.beginPath();c.moveTo(x,y-1);c.lineTo(x+(px-x)*.5,y+3);c.lineTo(px,py+2);c.stroke();
   }else if(region===1){
    c.strokeStyle='#527968';c.lineWidth=1;c.beginPath();c.moveTo(px,py);c.lineTo(px-2,py-6);c.moveTo(px,py);c.lineTo(px+3,py-8);c.stroke();
   }else if(region===2){
    c.fillStyle='#514f48';c.fillRect(px,py,5,3);c.fillStyle='#96917a';c.fillRect(px,py,4,1);
   }else if(k<2){
    c.fillStyle='#8da298';c.fillRect(px,py,8,4);c.fillStyle='#b9c4ac';c.fillRect(px,py,7,1);
   }
  }
 }
 // Broken shoulders and intermittent stepping stones soften straight route edges.
 for(const [ax,ay,bx,by] of world.paths){
  const len=Math.hypot(bx-ax,by-ay),nx=-(by-ay)/len,ny=(bx-ax)/len;
  for(let d=55;d<len-55;d+=18){
   const side=random()<.5?-1:1,offset=side*(24+random()*9),x=Math.round((ax+(bx-ax)*d/len+nx*offset)/2),y=Math.round((ay+(by-ay)*d/len+ny*offset)/2);
   const region=world.regionAt(x*2,y*2);
   c.fillStyle=['#869461','#8ca68b','#8c8069','#9caf9e'][region];c.fillRect(x,y,3+Math.floor(random()*4),2);
   if(region===3&&Math.floor(d)%3===0){c.fillStyle='#bbc4ad';c.fillRect(x-7,y-3,7,4);c.fillStyle='#728b83';c.fillRect(x-7,y+1,7,1)}
  }
 }
 // Reeds gather in beds, with open shore gaps rather than an even circular fence.
 for(const [x,y,r] of world.ponds)for(let i=0;i<22;i++){
  const a=(i%2?2.2:5.4)+(random()-.5)*.8,px=Math.round((x+Math.cos(a)*(r+5+random()*10))/2),py=Math.round((y+Math.sin(a)*(r+5+random()*10))/2);
  c.strokeStyle='#42664e';c.lineWidth=1;c.beginPath();c.moveTo(px,py);c.lineTo(px-2,py-7);c.moveTo(px,py);c.lineTo(px+2,py-9);c.stroke();c.fillStyle='#b1a778';c.fillRect(px+1,py-11,2,3);
 }
}
