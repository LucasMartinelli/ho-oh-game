import Phaser from 'phaser';
import {HOME,REGIONS,FEATHERS,STAGES,CONNECTIONS,CAMPS,BEACONS,coastline} from './adventure';
import {makeScenery,seeded} from './scenery';
import {TerrainPainter} from './terrain';
export const WORLD={w:8192,h:6144};
export interface Obstacle{x:number;y:number;r:number}
export class World{
 trees:{sprite:Phaser.GameObjects.Image;x:number;y:number;phase:number}[]=[];ponds=[[4100,4450,100],[4620,4630,85],[3450,4200,95],[1500,4220,70],[5850,2500,85]];obstacles:Obstacle[]=[];private grid=new Map<string,Obstacle[]>();
 paths=[...CONNECTIONS.map(([a,b])=>[STAGES[a].x,STAGES[a].y,STAGES[b].x,STAGES[b].y]),...CAMPS.slice(1).map((c,i)=>[REGIONS[i].x,REGIONS[i].y,c.x,c.y])];
 constructor(private scene:Phaser.Scene){
  makeScenery(scene);
  // Keep CPU canvases and GPU textures small; no full-world intermediate surface.
  const w=WORLD.w/2,h=WORLD.h/2,c=new TerrainPainter(scene,w,h);
  let seed=250;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
  c.fillStyle='#183c4b';c.fillRect(0,0,w,h);
  for(let i=0;i<14000;i++){const x=rand()*w,y=rand()*h;c.fillStyle=i%2?'#50878a25':'#0f2d3a35';c.fillRect(x,y,9+rand()*18,1)}
  const landPath=(expand:number)=>{c.beginPath();for(const p of STAGES){for(let k=0;k<=96;k++){const a=k*Math.PI/48,f=coastline(p.x,p.y,a),x=(p.x+Math.cos(a)*(p.rx+expand)*f)/2,y=(p.y+Math.sin(a)*(p.ry+expand)*f)/2;k?c.lineTo(x,y):c.moveTo(x,y)}c.closePath()}for(const [ax,ay,bx,by] of this.paths){const a=Math.atan2(by-ay,bx-ax),nx=Math.sin(a)*(85+expand)/2,ny=-Math.cos(a)*(85+expand)/2;c.moveTo(ax/2+nx,ay/2+ny);c.lineTo(bx/2+nx,by/2+ny);c.lineTo(bx/2-nx,by/2-ny);c.lineTo(ax/2-nx,ay/2-ny);c.closePath()}};
  for(const [expand,color] of [[55,'#38666b'],[29,'#789588'],[12,'#c3b68a'],[0,'#536b45']] as const){landPath(expand);c.fillStyle=color;c.fill()}
  c.save();landPath(0);c.clip();
  const colors=['#4d693d','#467965','#87704d','#68747a'];
  for(let y=0;y<h;y+=16)for(let x=0;x<w;x+=16){c.fillStyle=colors[this.regionAt(x*2,y*2)];c.fillRect(x,y,16,16)}
  for(let i=0;i<60000;i++){const x=rand()*w|0,y=rand()*h|0;c.fillStyle=i%3===0?'#fff2ac0b':'#16382b16';c.fillRect(x,y,2+rand()*5,2)}
  const reserves=[HOME,...REGIONS,...FEATHERS,...CAMPS,...BEACONS];
  const clear=(x:number,y:number,r:number)=>reserves.some(p=>Math.hypot(p.x-x,p.y-y)<r+105)||this.paths.some(([ax,ay,bx,by])=>this.distanceSegment(x,y,ax,ay,bx,by)<r+62);
  for(const width of [70,58,46]){c.strokeStyle=width===70?'#879067':width===58?'#a89b75':'#b6a780';c.lineWidth=width/2;c.lineJoin='round';c.lineCap='round';for(const [ax,ay,bx,by] of this.paths){c.beginPath();c.moveTo(ax/2,ay/2);c.lineTo(bx/2,by/2);c.stroke()}}
  const ponds=this.ponds;
  for(const [x,y,r] of ponds){this.obstacles.push({x,y,r});for(const [rr,col] of [[r+8,'#354e48'],[r+4,'#b8c69b'],[r,'#397f91'],[r-13,'#499bad']] as [number,string][]){c.fillStyle=col;c.beginPath();c.ellipse(x/2,y/2,rr/2,rr/2,0,0,Math.PI*2);c.fill()}const water=c.createRadialGradient(x/2-r*.12,y/2-r*.16,5,x/2,y/2,r/2);water.addColorStop(0,'#285d71');water.addColorStop(.6,'#397f8d');water.addColorStop(.88,'#64a9a4');water.addColorStop(1,'#91bca0');c.fillStyle=water;c.beginPath();for(let k=0;k<=64;k++){const a=k*Math.PI/32,rr=r/2*(.94+.025*Math.sin(a*5)+.02*Math.cos(a*7));const px=x/2+Math.cos(a)*rr,py=y/2+Math.sin(a)*rr;k?c.lineTo(px,py):c.moveTo(px,py)}c.closePath();c.fill();for(let i=0;i<40;i++){const a=rand()*6.28,d=rand()*(r-20)/2;c.fillStyle='#91c5bf70';c.fillRect(x/2+Math.cos(a)*d,y/2+Math.sin(a)*d,6+rand()*10,1)}}
  for(let i=0;i<4700;i++){const x=50+rand()*(WORLD.w-100),y=50+rand()*(WORLD.h-100);if(!this.onLand(x,y,75)||clear(x,y,24)||this.obstacles.some(o=>Math.hypot(o.x-x,o.y-y)<o.r+42))continue;const region=this.regionAt(x,y);if(i%5===0||region===2&&i%3===0){this.rock(c,x/2,y/2,region);this.obstacles.push({x,y,r:19})}else{this.tree(c,x/2,y/2,rand,region);this.obstacles.push({x,y:y+15,r:21})}}
  for(let i=0;i<8000;i++){const x=rand()*w|0,y=rand()*h|0;if(clear(x*2,y*2,-35)||this.obstacles.some(o=>Math.hypot(o.x/2-x,o.y/2-y)<o.r/2+4))continue;const reg=this.regionAt(x*2,y*2);c.fillStyle=i%7===0?['#d6d99c','#a8ced4','#e3ad72','#c6b6d9'][reg]:['#82925c','#73a18c','#a48c67','#99a1a4'][reg];c.fillRect(x,y,2,3);if(i%7)c.fillRect(x-2,y-1,1,2)}
  for(const p of [HOME,...REGIONS]){const x=p.x/2,y=p.y/2;c.fillStyle='#58675c';c.fillRect(x-61,y-57,122,114);for(let j=-4;j<=4;j++)for(let i=-4;i<=4;i++){c.fillStyle=(i+j)%2?'#9b9f85':'#8d967d';c.fillRect(x+i*13-6,y+j*12-5,12,11)}c.strokeStyle='#d4c792';c.lineWidth=2;c.beginPath();c.arc(x,y,40,0,6.28);c.stroke();c.beginPath();c.arc(x,y,32,0,6.28);c.stroke();for(let i=0;i<4;i++){const a=i*Math.PI/2;c.fillStyle='#c2bd94';c.fillRect(x+Math.cos(a)*47-3,y+Math.sin(a)*43-3,6,6)}}
  const dressing=seeded(8441);
  for(let i=0;i<8000;i++){const x=dressing()*w,y=dressing()*h;const path=this.paths.some(([ax,ay,bx,by])=>this.distanceSegment(x*2,y*2,ax,ay,bx,by)<22);if(path){c.fillStyle=i%2?'#6b634530':'#f0deac35';c.fillRect(x,y,1+dressing()*2,1)}else if(i%4===0){c.fillStyle='#c6b67538';c.fillRect(x,y,2,1);c.fillStyle='#293e2730';c.fillRect(x+1,y+1,3,1)}}
  for(const [x,y,r] of ponds){const random=seeded(x+y);for(let i=0;i<30;i++){const a=random()*6.28,px=(x+Math.cos(a)*(r+6))/2,py=(y+Math.sin(a)*(r+6))/2;c.strokeStyle='#345a40';c.lineWidth=1;c.beginPath();c.moveTo(px,py);c.lineTo(px-2,py-7-random()*5);c.moveTo(px,py);c.lineTo(px+3,py-5);c.stroke();c.fillStyle='#b4a36c';c.fillRect(px-3,py-10,2,3)}}
  // Timber spans, shrine architecture and illuminated trail markers.
  for(const [ax,ay,bx,by] of this.paths){const length=Math.hypot(bx-ax,by-ay),angle=Math.atan2(by-ay,bx-ax);for(let d=20;d<length;d+=18){const x=ax+(bx-ax)*d/length,y=ay+(by-ay)*d/length;if(STAGES.some(p=>Math.hypot((x-p.x)/p.rx,(y-p.y)/p.ry)<1))continue;c.save();c.translate(x/2,y/2);c.rotate(angle);c.fillStyle='#3a3029';c.fillRect(-5,-43,10,86);c.fillStyle=d%36===20?'#aa8551':'#907447';c.fillRect(-4,-39,8,78);c.fillStyle='#d7b87b';c.fillRect(-4,-43,8,3);c.fillRect(-4,40,8,3);c.restore()}}
  for(const [i,p] of BEACONS.entries()){c.fillStyle='#344a40';c.fillRect(p.x/2-23,p.y/2-17,46,34);for(let j=0;j<4;j++){c.fillStyle=j%2?'#c0bea1':'#8a9b87';c.fillRect(p.x/2-18+j*3,p.y/2-19-j*3,36-j*6,8)}c.fillStyle='#d9cba1';c.fillRect(p.x/2-5,p.y/2-45,10,28);c.fillStyle='#786e61';c.fillRect(p.x/2+2,p.y/2-43,3,26);c.fillStyle='#e6bf74';c.fillRect(p.x/2-9,p.y/2-49,18,6);if(i>=6){for(const offset of [-65,65]){c.fillStyle='#b1b6aa';c.fillRect((p.x+offset)/2-6,p.y/2-40,12,35);c.fillStyle='#d7d1b4';c.fillRect((p.x+offset)/2-9,p.y/2-43,18,5)}}}
  for(const p of CAMPS){c.fillStyle='#304d3a';c.beginPath();c.ellipse(p.x/2,p.y/2,50,29,0,0,6.28);c.fill();c.fillStyle='#796547';c.fillRect(p.x/2-43,p.y/2-18,38,22);c.fillStyle='#c0b684';c.beginPath();c.moveTo(p.x/2-50,p.y/2-18);c.lineTo(p.x/2-25,p.y/2-45);c.lineTo(p.x/2,p.y/2-18);c.fill();c.fillStyle='#e7d7a1';c.fillRect(p.x/2-27,p.y/2-28,3,30);c.fillStyle='#5c5140';c.fillRect(p.x/2+18,p.y/2-2,20,4);c.fillRect(p.x/2+22,p.y/2-7,4,16)}
  for(const [ax,ay,bx,by] of this.paths){const len=Math.hypot(bx-ax,by-ay);for(let d=180;d<len;d+=240){const x=ax+(bx-ax)*d/len+Math.sin(Math.atan2(by-ay,bx-ax))*70,y=ay+(by-ay)*d/len-Math.cos(Math.atan2(by-ay,bx-ax))*70;c.fillStyle='#4a4533';c.fillRect(x/2-2,y/2-12,4,17);c.fillStyle='#e5bd70';c.fillRect(x/2-4,y/2-16,8,7);c.fillStyle='#fff0af';c.fillRect(x/2-2,y/2-15,4,4)}}
  // Ruined arcades and basalt ridges make the later chapters distinct.
  for(const stage of STAGES.filter(p=>p.region>=2)){for(let i=0;i<14;i++){const a=i*Math.PI/7,x=stage.x+Math.cos(a)*stage.rx*.81,y=stage.y+Math.sin(a)*stage.ry*.81;if(clear(x,y,40)||this.obstacles.some(o=>Math.hypot(o.x-x,o.y-y)<o.r+60))continue;
   if(stage.region===2){const xx=x/2,yy=y/2;c.fillStyle='#373c38';c.beginPath();c.moveTo(xx-28,yy+10);c.lineTo(xx-19,yy-28);c.lineTo(xx+11,yy-39);c.lineTo(xx+29,yy-9);c.lineTo(xx+21,yy+17);c.closePath();c.fill();c.fillStyle='#817258';c.beginPath();c.moveTo(xx-19,yy-28);c.lineTo(xx+11,yy-39);c.lineTo(xx+24,yy-13);c.lineTo(xx-6,yy-5);c.closePath();c.fill();c.strokeStyle='#b29b6b';c.lineWidth=2;c.beginPath();c.moveTo(xx-14,yy-25);c.lineTo(xx+7,yy-34);c.stroke();c.strokeStyle='#1f2b2a';c.beginPath();c.moveTo(xx-6,yy-5);c.lineTo(xx-9,yy+11);c.stroke()}
   else{c.fillStyle='#3e5051';c.fillRect(x/2-17,y/2-6,38,13);c.fillStyle='#9da89f';c.fillRect(x/2-12,y/2-43,24,40);c.fillStyle='#c7c9b0';c.fillRect(x/2-17,y/2-48,34,7);c.fillRect(x/2-15,y/2-8,30,5);c.fillStyle='#657a73';for(let j=0;j<3;j++)c.fillRect(x/2-7+j*7,y/2-40,2,30);c.fillStyle='#7d9564';c.fillRect(x/2-15,y/2-10,9,8)}this.obstacles.push({x,y,r:42})}}
  for(const p of STAGES.filter(p=>p.region===3)){for(let i=0;i<35;i++){const x=p.x+(dressing()-.5)*250,y=p.y+(dressing()-.5)*250;c.fillStyle=i%2?'#c1c5ad35':'#30474640';c.fillRect(x/2,y/2,10,6)}}
  c.restore();
  c.refresh();
  for(const o of this.obstacles){const minx=Math.floor((o.x-o.r)/128),maxx=Math.floor((o.x+o.r)/128),miny=Math.floor((o.y-o.r)/128),maxy=Math.floor((o.y+o.r)/128);for(let x=minx;x<=maxx;x++)for(let y=miny;y<=maxy;y++){const key=x+','+y;const a=this.grid.get(key)||[];a.push(o);this.grid.set(key,a)}}
 }
 regionAt(x:number,y:number){let best=Infinity,region=0;for(const p of STAGES){const d=(p.x-x)**2+(p.y-y)**2;if(d<best){best=d;region=p.region}}return region}
 stageAt(x:number,y:number){return STAGES.reduce((a,b)=>Math.hypot(a.x-x,a.y-y)<Math.hypot(b.x-x,b.y-y)?a:b)}
 onLand(x:number,y:number,r=0){return STAGES.some(p=>Math.hypot((x-p.x)/p.rx,(y-p.y)/p.ry)<=coastline(p.x,p.y,Math.atan2((y-p.y)/p.ry,(x-p.x)/p.rx))-r/Math.min(p.rx,p.ry))||this.paths.some(([ax,ay,bx,by])=>this.distanceSegment(x,y,ax,ay,bx,by)<85-r)}
 distanceSegment(x:number,y:number,ax:number,ay:number,bx:number,by:number){const dx=bx-ax,dy=by-ay,t=Phaser.Math.Clamp(((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy),0,1);return Math.hypot(x-ax-t*dx,y-ay-t*dy)}
 private tree(c:TerrainPainter,x:number,y:number,rand:()=>number,region:number){
  // Preserve the generation stream so existing saves retain identical solid geometry.
  for(let i=0;i<26;i++)rand();
  c.fillStyle='#152d2240';c.beginPath();c.ellipse(x+9,y+9,27,11,-.28,0,6.28);c.fill();
  const random=seeded(Math.floor(x*713+y*311));const variant=Math.floor(random()*4);
  const sprite=this.scene.add.image(x*2,y*2+18,`tree-${region}-${variant}`).setOrigin(.5,.9).setScale(1.25).setDepth(y*2+28);
  this.trees.push({sprite,x:x*2,y:y*2+18,phase:random()*6.28});
 }
 private rock(c:TerrainPainter,x:number,y:number,region:number){
  const rnd=seeded(Math.floor(x*141+y*541)),pal=region===2?['#4c463b','#7b7059','#ab9771','#d0bb8d']:['#394b43','#6d7c6b','#9fa78b','#c2c9a6'];
  const poly=(pts:number[][],col:string)=>{c.fillStyle=col;c.beginPath();pts.forEach(([px,py],i)=>i?c.lineTo(x+px,y+py):c.moveTo(x+px,y+py));c.closePath();c.fill()};
  poly([[-12,5],[-9,-7],[0,-12],[11,-8],[15,5],[8,12],[-7,11]],pal[0]);poly([[-10,2],[-7,-7],[0,-10],[10,-6],[7,5],[-3,7]],pal[1]);poly([[-7,-7],[0,-10],[10,-6],[3,-1],[-7,0]],pal[2]);poly([[-6,-7],[0,-9],[7,-6],[1,-4]],pal[3]);
  for(let i=0;i<25;i++){c.fillStyle=i%2?'#738453':'#a1a66b';const px=-9+rnd()*17,py=3+rnd()*6;c.fillRect(x+px,y+py,2,1)}c.strokeStyle=pal[0];c.lineWidth=.7;c.beginPath();c.moveTo(x+3,y-1);c.lineTo(x+1,y+3);c.lineTo(x+4,y+5);c.stroke();
 }
 blocked(x:number,y:number,r:number){if(!this.onLand(x,y,r))return true;if(x<r+25||y<r+25||x>WORLD.w-r-25||y>WORLD.h-r-25)return true;for(let gx=Math.floor((x-r)/128);gx<=Math.floor((x+r)/128);gx++)for(let gy=Math.floor((y-r)/128);gy<=Math.floor((y+r)/128);gy++)for(const o of this.grid.get(gx+','+gy)||[]){if(Math.hypot(x-o.x,y-o.y)<r+o.r)return true}return false}
 lineClear(ax:number,ay:number,bx:number,by:number){const n=Math.ceil(Math.hypot(bx-ax,by-ay)/12);for(let i=1;i<=n;i++){if(this.blocked(ax+(bx-ax)*i/n,ay+(by-ay)*i/n,2))return false}return true}
 ray(x:number,y:number,angle:number,max:number){for(let d=8;d<=max;d+=8)if(this.blocked(x+Math.cos(angle)*d,y+Math.sin(angle)*d,3))return Math.max(0,d-5);return max}
 move(actor:{x:number;y:number;r:number},dx:number,dy:number){const steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/8));for(let i=0;i<steps;i++){if(!this.blocked(actor.x+dx/steps,actor.y,actor.r))actor.x+=dx/steps;if(!this.blocked(actor.x,actor.y+dy/steps,actor.r))actor.y+=dy/steps}}
}
