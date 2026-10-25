import Phaser from 'phaser';
import {HOME,REGIONS,FEATHERS,STAGES,CONNECTIONS,CAMPS,BEACONS,GATES,HAZARDS,coastline} from './adventure';
import {makeScenery,seeded} from './scenery';
import {TerrainPainter} from './terrain';
import {paintSettlements,SETTLEMENT_LAYOUTS} from './settlements';
export const WORLD={w:8192,h:6144};
export interface Obstacle{x:number;y:number;r:number;sr?:number}
export interface Gate {id:string;kind:string;needs:string;xp:number;name:string;x:number;y:number;r:number;o:Obstacle;img?:Phaser.GameObjects.Image}
export interface HazardSpot {kind:string;x:number;y:number;region:number;dir:{x:number;y:number};img?:Phaser.GameObjects.Image}
export class World{
 trees:{sprite:Phaser.GameObjects.Image;x:number;y:number;phase:number}[]=[];ponds=[[4100,4450,100],[4620,4630,85],[3450,4200,95],[1500,4220,70],[5850,2500,85]];obstacles:Obstacle[]=[];gates:Gate[]=[];hazards:HazardSpot[]=[];torches:{x:number;y:number}[]=[];ruins:{x:number;y:number;kind:string}[]=[];flames:Phaser.GameObjects.Sprite[]=[];private grid=new Map<string,Obstacle[]>();
 paths=[...CONNECTIONS.map(([a,b])=>[STAGES[a].x,STAGES[a].y,STAGES[b].x,STAGES[b].y]),...CAMPS.slice(1).map((c,i)=>[REGIONS[i].x,REGIONS[i].y,c.x,c.y])];
 constructor(private scene:Phaser.Scene){
  makeScenery(scene);
  // Keep CPU canvases and GPU textures small; no full-world intermediate surface.
  const w=WORLD.w/2,h=WORLD.h/2,c=new TerrainPainter(scene,w,h);
  let seed=250;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
  c.fillStyle='#183c4b';c.fillRect(0,0,w,h);
  const img=(k:string)=>scene.textures.get(k).getSourceImage() as CanvasImageSource;
  c.fillStyle=c.pattern(scene,'scn-water');c.fillRect(0,0,w,h);
  for(let i=0;i<14000;i++){const x=rand()*w,y=rand()*h;c.fillStyle=i%2?'#50878a20':'#0f2d3a30';c.fillRect(x,y,9+rand()*18,1)}
  const landPath=(expand:number)=>{c.beginPath();for(const p of STAGES){for(let k=0;k<=96;k++){const a=k*Math.PI/48,f=coastline(p.x,p.y,a),x=(p.x+Math.cos(a)*(p.rx+expand)*f)/2,y=(p.y+Math.sin(a)*(p.ry+expand)*f)/2;k?c.lineTo(x,y):c.moveTo(x,y)}c.closePath()}for(const [ax,ay,bx,by] of this.paths){const a=Math.atan2(by-ay,bx-ax),nx=Math.sin(a)*(85+expand)/2,ny=-Math.cos(a)*(85+expand)/2;c.moveTo(ax/2+nx,ay/2+ny);c.lineTo(bx/2+nx,by/2+ny);c.lineTo(bx/2-nx,by/2-ny);c.lineTo(ax/2-nx,ay/2-ny);c.closePath()}};
  for(const [expand,color] of [[55,'#326b77'],[32,'#578d8c'],[13,'#c3b68a'],[0,'#536b45']] as const){landPath(expand);c.fillStyle=color;c.fill()}
  c.save();landPath(0);c.clip();
  // Grass tiles per biome, hashed per cell so the random stream is untouched.
  const grass=[0,1,2,3].map(r=>[img(`scn-g${r}_0`),img(`scn-g${r}_1`),img(`scn-g${r}_2`),img(`scn-g${r}_3`)]);
  for(let y=0;y<h;y+=16)for(let x=0;x<w;x+=16){const hash=Math.imul((x/16)^Math.imul(y/16,374761393),668265263)>>>0;const r=this.regionAt(x*2+8+(hash%65-32),y*2+8+((hash>>>8)%65-32));const v=hash%10<6?0:1+(hash>>>16)%3;c.drawImage(grass[r][v],0,0,16,16,x,y,16,16)}
  for(let i=0;i<60000;i++){const x=rand()*w|0,y=rand()*h|0;c.fillStyle=i%3===0?'#fff2ac0b':'#16382b16';c.fillRect(x,y,2+rand()*5,2)}
  const reserves=[HOME,...REGIONS,...FEATHERS,...CAMPS,...BEACONS];
  const clear=(x:number,y:number,r:number)=>reserves.some(p=>Math.hypot(p.x-x,p.y-y)<r+105)||this.paths.some(([ax,ay,bx,by])=>this.distanceSegment(x,y,ax,ay,bx,by)<r+62);
  const dirtPat=c.pattern(scene,'scn-dirt'),sandPat=c.pattern(scene,'scn-sand');
  for(const width of [70,58,46]){c.strokeStyle=width===70?'#526e4d':width===58?sandPat:dirtPat;c.lineWidth=width/2;c.lineJoin='round';c.lineCap='round';for(const [ax,ay,bx,by] of this.paths){c.beginPath();c.moveTo(ax/2,ay/2);c.lineTo(bx/2,by/2);c.stroke()}}
  const ponds=this.ponds;
  const pondPat=c.pattern(scene,'scn-water2');
  for(const [x,y,r] of ponds){this.obstacles.push({x,y,r});for(const [rr,col] of [[r+8,'#354e48'],[r+4,'#b8c69b'],[r,'#397f91'],[r-13,'#499bad']] as [number,string][]){c.fillStyle=col;c.beginPath();c.ellipse(x/2,y/2,rr/2,rr/2,0,0,Math.PI*2);c.fill()}c.fillStyle=pondPat;c.beginPath();for(let k=0;k<=64;k++){const a=k*Math.PI/32,rr=r/2*(.94+.025*Math.sin(a*5)+.02*Math.cos(a*7));const px=x/2+Math.cos(a)*rr,py=y/2+Math.sin(a)*rr;k?c.lineTo(px,py):c.moveTo(px,py)}c.closePath();c.fill();const water=c.createRadialGradient(x/2-r*.12,y/2-r*.16,5,x/2,y/2,r/2);water.addColorStop(0,'#285d7160');water.addColorStop(.6,'#397f8d40');water.addColorStop(.88,'#64a9a420');water.addColorStop(1,'#91bca000');c.fillStyle=water;c.beginPath();for(let k=0;k<=64;k++){const a=k*Math.PI/32,rr=r/2*(.94+.025*Math.sin(a*5)+.02*Math.cos(a*7));const px=x/2+Math.cos(a)*rr,py=y/2+Math.sin(a)*rr;k?c.lineTo(px,py):c.moveTo(px,py)}c.closePath();c.fill();for(let i=0;i<40;i++){const a=rand()*6.28,d=rand()*(r-20)/2;c.fillStyle='#91c5bf70';c.fillRect(x/2+Math.cos(a)*d,y/2+Math.sin(a)*d,6+rand()*10,1)}}
  for(let i=0;i<4700;i++){const x=50+rand()*(WORLD.w-100),y=50+rand()*(WORLD.h-100);if(!this.onLand(x,y,75)||clear(x,y,24)||this.obstacles.some(o=>Math.hypot(o.x-x,o.y-y)<(o.sr??o.r)+42))continue;const region=this.regionAt(x,y);if(i%5===0||region===2&&i%3===0){this.rock(c,x/2,y/2,region);this.obstacles.push({x,y,r:15,sr:19})}else{this.tree(c,x/2,y/2,rand,region);this.obstacles.push({x,y:y+15,r:17,sr:21})}}
  for(let i=0;i<8000;i++){const x=rand()*w|0,y=rand()*h|0;if(clear(x*2,y*2,-35)||this.obstacles.some(o=>Math.hypot(o.x/2-x,o.y/2-y)<(o.sr??o.r)/2+4))continue;const reg=this.regionAt(x*2,y*2);c.fillStyle=i%7===0?['#d6d99c','#a8ced4','#e3ad72','#c6b6d9'][reg]:['#82925c','#73a18c','#a48c67','#99a1a4'][reg];c.fillRect(x,y,2,3);if(i%7)c.fillRect(x-2,y-1,1,2)}
  // Small, clustered tile stamps give each clearing an understory. This random
  // stream is independent of collision generation and never changes save geometry.
  const garden=seeded(91904);
  for(const stage of STAGES)for(let patch=0;patch<8;patch++){
   const a=garden()*Math.PI*2,d=.25+garden()*.6;
   const cx=stage.x+Math.cos(a)*stage.rx*d,cy=stage.y+Math.sin(a)*stage.ry*d;
   for(let k=0;k<6;k++){
    const x=Math.round((cx+(garden()-.5)*150)/2),y=Math.round((cy+(garden()-.5)*100)/2);
    if(!this.onLand(x*2,y*2,24)||clear(x*2,y*2,12)||this.obstacles.some(o=>Math.hypot(o.x-x*2,o.y-y*2)<o.r+20))continue;
    const key=stage.region===2?'scn-ground-rubble':`scn-ground-${k%3?'tuft':'flower'}-${stage.region}`;
    const size=stage.region===2?10:k%3?8:16;
    c.drawImage(img(key),0,0,16,16,x-size/2,y-size/2,size,size);
   }
  }
  const dressing=seeded(8441);
  for(let i=0;i<8000;i++){const x=dressing()*w,y=dressing()*h;const path=this.paths.some(([ax,ay,bx,by])=>this.distanceSegment(x*2,y*2,ax,ay,bx,by)<22);if(path){c.fillStyle=i%2?'#6b634530':'#f0deac35';c.fillRect(x,y,1+dressing()*2,1)}else if(i%4===0){c.fillStyle='#c6b67538';c.fillRect(x,y,2,1);c.fillStyle='#293e2730';c.fillRect(x+1,y+1,3,1)}}
  for(const [x,y,r] of ponds){const random=seeded(x+y);for(let i=0;i<30;i++){const a=random()*6.28,px=(x+Math.cos(a)*(r+6))/2,py=(y+Math.sin(a)*(r+6))/2;c.strokeStyle='#345a40';c.lineWidth=1;c.beginPath();c.moveTo(px,py);c.lineTo(px-2,py-7-random()*5);c.moveTo(px,py);c.lineTo(px+3,py-5);c.stroke();c.fillStyle='#b4a36c';c.fillRect(px-3,py-10,2,3)}}
  // Timber spans, shrine architecture and illuminated trail markers.
  for(const [ax,ay,bx,by] of this.paths){const length=Math.hypot(bx-ax,by-ay),angle=Math.atan2(by-ay,bx-ax);for(let d=20;d<length;d+=18){const x=ax+(bx-ax)*d/length,y=ay+(by-ay)*d/length;if(STAGES.some(p=>Math.hypot((x-p.x)/p.rx,(y-p.y)/p.ry)<1))continue;c.save();c.translate(x/2,y/2);c.rotate(angle);c.fillStyle='#3a3029';c.fillRect(-5,-43,10,86);c.fillStyle=d%36===20?'#aa8551':'#907447';c.fillRect(-4,-39,8,78);c.fillStyle='#d7b87b';c.fillRect(-4,-43,8,3);c.fillRect(-4,40,8,3);c.restore()}}
  // Stone plinths under the beacon monuments (the monuments themselves are sprites).
  const stonePat=c.pattern(scene,'scn-stone');
  for(const p of BEACONS){c.fillStyle='#344a40';c.beginPath();c.ellipse(p.x/2,p.y/2+4,34,20,0,0,6.28);c.fill();c.fillStyle=stonePat;c.beginPath();c.ellipse(p.x/2,p.y/2+3,28,15,0,0,6.28);c.fill()}
  paintSettlements(scene,c,this.obstacles);
  for(const [ax,ay,bx,by] of this.paths){const len=Math.hypot(bx-ax,by-ay);for(let d=180;d<len;d+=240){const x=ax+(bx-ax)*d/len+Math.sin(Math.atan2(by-ay,bx-ax))*70,y=ay+(by-ay)*d/len-Math.cos(Math.atan2(by-ay,bx-ax))*70;if(this.onLand(x,y,16)&&!ponds.some(([px,py,r])=>Math.hypot(x-px,y-py)<r+18)&&!CAMPS.some(p=>Math.hypot(x-p.x,y-p.y)<150)&&!REGIONS.some(p=>Math.hypot(x-p.x,y-p.y)<150))this.torches.push({x,y})}}
  // Ruined arcades and basalt ridges mark the later chapters (sprites, not paint).
  for(const stage of STAGES.filter(p=>p.region>=2)){for(let i=0;i<14;i++){const a=i*Math.PI/7,x=stage.x+Math.cos(a)*stage.rx*.81,y=stage.y+Math.sin(a)*stage.ry*.81;if(clear(x,y,40)||this.obstacles.some(o=>Math.hypot(o.x-x,o.y-y)<(o.sr??o.r)+60))continue;
   this.ruins.push({x,y,kind:stage.region===2?'basalt':'ruin-col'});this.obstacles.push({x,y,r:42})}}
  for(const p of STAGES.filter(p=>p.region===3)){for(let i=0;i<35;i++){const x=p.x+(dressing()-.5)*250,y=p.y+(dressing()-.5)*250;c.fillStyle=i%2?'#c1c5ad35':'#30474640';c.fillRect(x/2,y/2,10,6)}}
  c.restore();
  c.refresh();
  for(const o of this.obstacles)this.index(o);
  // Ability gates and hazard spots resolve after generation, without touching the random stream.
  for(const g of GATES){const s=STAGES[g.stage],p=this.resolve(s.x+g.dx,s.y+g.dy,38);if(p)this.gates.push({...g,x:p.x,y:p.y,r:34,o:this.addObstacle({x:p.x,y:p.y,r:34})})}
  for(const h of HAZARDS){const s=STAGES[h.stage],p=this.resolve(s.x+h.dx,s.y+h.dy,30);if(p){const cx=s.x-p.x,cy=s.y-p.y,d=Math.hypot(cx,cy)||1;this.hazards.push({kind:h.kind,x:p.x,y:p.y,region:s.region,dir:{x:cx/d,y:cy/d}})}}
  // ---- Sprite structures (Kenney Tiny Town CC0 / Tiny 16 CC-BY, see CREDITS.md)
  const deco=(key:string,x:number,y:number,oy=0)=>scene.add.image(x,y,key).setOrigin(.5,1).setDepth(y+oy);
  deco('scn-home-shrine',HOME.x,HOME.y-114);
  REGIONS.forEach((r,i)=>{deco(`scn-shrine-${i}`,r.x,r.y-70);for(const side of [-1,1]){deco('scn-ruin-col',r.x+side*90,r.y+12);deco('scn-pot',r.x+side*78,r.y-72)}});
  const BSPR=['scn-beacon-lantern','scn-beacon-root','scn-lighthouse','scn-beacon-fountain','scn-beacon-base','scn-beacon-base','scn-beacon-obelisk','scn-beacon-star'];
  if(!scene.anims.exists('fire'))scene.anims.create({key:'fire',frames:scene.anims.generateFrameNumbers('scn-fire',{start:0,end:2}),frameRate:7,repeat:-1});
  if(!scene.anims.exists('icefire'))scene.anims.create({key:'icefire',frames:scene.anims.generateFrameNumbers('scn-icefire',{start:0,end:2}),frameRate:7,repeat:-1});
  if(!scene.anims.exists('brazier'))scene.anims.create({key:'brazier',frames:scene.anims.generateFrameNumbers('scn-brazier',{start:0,end:2}),frameRate:7,repeat:-1});
  BEACONS.forEach((b,i)=>{deco(BSPR[i],b.x,b.y+16,20);if(i===4||i===5)this.flames.push(scene.add.sprite(b.x,b.y-46,'scn-brazier').setDepth(b.y+22).play('brazier'));if(i===6)this.flames.push(scene.add.sprite(b.x,b.y-58,'scn-icefire').setDepth(b.y+22).play('icefire'));if(i===7)this.flames.push(scene.add.sprite(b.x,b.y-52,'scn-icefire').setDepth(b.y+22).play('icefire'))});
  CAMPS.forEach((p,i)=>{
   const region=Math.max(0,i-1),plan=SETTLEMENT_LAYOUTS[i];
   const prop=(key:string,pos:readonly [number,number])=>deco(key,p.x+pos[0],p.y+pos[1]);
   prop(`scn-house-${region}`,plan.house);
   if(plan.annex)prop('scn-house-1',plan.annex);
   if(plan.well)prop('scn-well',plan.well);
   prop('scn-sign',plan.sign);prop('scn-bench',plan.bench);
   // One planter by the door and a garden fence, rather than loose containers.
   prop('scn-pot',[plan.house[0]+34,plan.house[1]+4]);
   prop('scn-fence',[plan.garden[0],plan.garden[1]+24]);
  });
  for(const t of this.torches)deco('scn-torch',t.x,t.y+20,4);
  for(const r of this.ruins)deco('scn-'+r.kind,r.x,r.y+34,8);
  for(const g of this.gates){const s=deco(`scn-gate-${g.kind}`,g.x,g.y+30,30);g.img=s}
  for(const hz of this.hazards)hz.img=deco(`scn-hz-${hz.kind}`,hz.x,hz.y+22,4);
 }
 private index(o:Obstacle){const minx=Math.floor((o.x-o.r)/128),maxx=Math.floor((o.x+o.r)/128),miny=Math.floor((o.y-o.r)/128),maxy=Math.floor((o.y+o.r)/128);for(let x=minx;x<=maxx;x++)for(let y=miny;y<=maxy;y++){const key=x+','+y;const a=this.grid.get(key)||[];a.push(o);this.grid.set(key,a)}}
 private addObstacle(o:Obstacle){this.obstacles.push(o);this.index(o);return o}
 release(o:Obstacle){this.obstacles.splice(this.obstacles.indexOf(o),1);for(const [key,cell] of this.grid){const i=cell.indexOf(o);if(i>=0)cell.splice(i,1)}}
 resolve(x:number,y:number,r:number){if(!this.blocked(x,y,r))return{x,y};for(let i=0;i<150;i++){const a=i*2.4,d=30+Math.floor(i/8)*16,px=x+Math.cos(a)*d,py=y+Math.sin(a)*d;if(!this.blocked(px,py,r))return{x:px,y:py}}return null}
 regionAt(x:number,y:number){let best=Infinity,region=0;for(const p of STAGES){const d=(p.x-x)**2+(p.y-y)**2;if(d<best){best=d;region=p.region}}return region}
 stageAt(x:number,y:number){return STAGES.reduce((a,b)=>Math.hypot(a.x-x,a.y-y)<Math.hypot(b.x-x,b.y-y)?a:b)}
 onLand(x:number,y:number,r=0){return STAGES.some(p=>Math.hypot((x-p.x)/p.rx,(y-p.y)/p.ry)<=coastline(p.x,p.y,Math.atan2((y-p.y)/p.ry,(x-p.x)/p.rx))-r/Math.min(p.rx,p.ry))||this.paths.some(([ax,ay,bx,by])=>this.distanceSegment(x,y,ax,ay,bx,by)<85-r)}
 distanceSegment(x:number,y:number,ax:number,ay:number,bx:number,by:number){const dx=bx-ax,dy=by-ay,t=Phaser.Math.Clamp(((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy),0,1);return Math.hypot(x-ax-t*dx,y-ay-t*dy)}
 private tree(c:TerrainPainter,x:number,y:number,rand:()=>number,region:number){
  // Preserve the generation stream so existing saves retain identical solid geometry.
  for(let i=0;i<26;i++)rand();
  c.fillStyle='#152d2240';c.beginPath();c.ellipse(x+5,y+6,17,7,-.28,0,6.28);c.fill();
  const random=seeded(Math.floor(x*713+y*311));const variant=Math.floor(random()*4);
  const species=['tree-round','tree-oak','tree-pine','tree-round','tree-pine','tree-round','tree-round','tree-pine','tree-dead','tree-dead2','tree-pine2','tree-dead','tree-mush','tree-pine','tree-round','tree-oak'];
  const key=`scn-${species[region*4+variant]}${region}`;
  const sprite=this.scene.add.image(x*2,y*2+18,key).setOrigin(.5,.92).setScale(1).setDepth(y*2+28);
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
 private obstacleAt(x:number,y:number,r:number){let hit:Obstacle|null=null,deep=0;for(let gx=Math.floor((x-r)/128);gx<=Math.floor((x+r)/128);gx++)for(let gy=Math.floor((y-r)/128);gy<=Math.floor((y+r)/128);gy++)for(const o of this.grid.get(gx+','+gy)||[]){const over=r+o.r-Math.hypot(x-o.x,y-o.y);if(over>deep){deep=over;hit=o}}return hit?{o:hit,deep}:null}
 private unstick(actor:{x:number;y:number;r:number}){for(let pass=0;pass<4;pass++){const hit=this.obstacleAt(actor.x,actor.y,actor.r);if(!hit)return;const ox=actor.x-hit.o.x,oy=actor.y-hit.o.y,d=Math.hypot(ox,oy),ux=d>0.01?ox/d:1,uy=d>0.01?oy/d:0;let moved=false;for(const [px,py] of [[ux,uy],[-uy,ux],[uy,-ux]] as const){const tx=actor.x+px*(hit.deep+.5),ty=actor.y+py*(hit.deep+.5);if(!this.blocked(tx,ty,actor.r)){actor.x=tx;actor.y=ty;moved=true;break}}if(!moved)return}}
 private freeNormal(x:number,y:number,r:number){const hit=this.obstacleAt(x,y,r);if(hit){const ox=x-hit.o.x,oy=y-hit.o.y,l=Math.hypot(ox,oy)||1;return{x:ox/l,y:oy/l}}const e=3,nx=Number(this.onLand(x+e,y,r))-Number(this.onLand(x-e,y,r)),ny=Number(this.onLand(x,y+e,r))-Number(this.onLand(x,y-e,r));if(!nx&&!ny)return null;const l=Math.hypot(nx,ny);return{x:nx/l,y:ny/l}}
 move(actor:{x:number;y:number;r:number},dx:number,dy:number){const steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/8));for(let i=0;i<steps;i++){let mx=dx/steps,my=dy/steps,moved=false;for(let tries=0;tries<3&&(mx||my);tries++){const tx=actor.x+mx,ty=actor.y+my;if(!this.blocked(tx,ty,actor.r)){actor.x=tx;actor.y=ty;moved=true;break}const n=this.freeNormal(tx,ty,actor.r);if(!n)break;const dot=mx*n.x+my*n.y;if(dot>=0)break;mx-=n.x*dot;my-=n.y*dot}
  if(!moved){if(!this.blocked(actor.x+mx,actor.y,actor.r))actor.x+=mx;else if(!this.blocked(actor.x,actor.y+my,actor.r))actor.y+=my}}
  this.unstick(actor)}
}
