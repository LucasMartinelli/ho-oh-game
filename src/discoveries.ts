import Phaser from 'phaser';
import type {BattleScene} from './scene';
import {STAGES,CAMPS,BEACONS,REGIONS} from './adventure';
const SITES=[
 {stage:1,dx:-230,dy:120,name:'Baú das Lanternas',kind:'cache',xp:120},
 {stage:6,dx:210,dy:-130,name:'Correntes da Maré',kind:'trail',xp:180},
 {stage:10,dx:-220,dy:-140,name:'Ninho de Cinzas',kind:'ambush',xp:220},
 {stage:15,dx:230,dy:140,name:'Relíquia do Céu',kind:'cache',xp:240}
] as const;
interface Site {x:number;y:number;points:{x:number;y:number}[];sprite:Phaser.GameObjects.Image;label:Phaser.GameObjects.Text}
export class Discoveries {
 sites:Site[]=[];active=-1;step=0;remaining=0;private graphics:Phaser.GameObjects.Graphics;
 constructor(private s:BattleScene){
  const tex=s.textures.createCanvas('journey-chest',32,28)!,c=tex.context;
  c.fillStyle='#162f26';c.fillRect(2,10,28,16);c.fillStyle='#704627';c.fillRect(4,12,24,13);c.fillStyle='#b68346';c.fillRect(4,7,24,9);c.fillStyle='#dec78a';c.fillRect(4,7,24,2);c.fillRect(3,15,26,2);c.fillRect(7,8,3,17);c.fillRect(22,8,3,17);c.fillStyle='#55351f';c.fillRect(11,20,10,2);c.fillStyle='#ffecaa';c.fillRect(14,13,5,7);c.fillStyle='#6e5431';c.fillRect(16,15,1,3);tex.refresh();
  this.graphics=s.add.graphics().setDepth(8800);
  for(const spec of SITES){
   const stage=STAGES[spec.stage],nodes=this.reachable(stage.x,stage.y);
   const nearest=(x:number,y:number)=>nodes.reduce((a,b)=>Math.hypot(a.x-x,a.y-y)<Math.hypot(b.x-x,b.y-y)?a:b);
   const point=nearest(stage.x+spec.dx,stage.y+spec.dy),points=[nearest(point.x-95,point.y-60),nearest(point.x+95,point.y-90),nearest(point.x+70,point.y+95)];
   const sprite=s.add.image(point.x,point.y,'journey-chest').setScale(1.8).setDepth(point.y+35);
   const label=s.add.text(point.x,point.y-45,spec.name,{fontSize:'16px',color:'#ffe6a3',stroke:'#153c30',strokeThickness:4}).setOrigin(.5).setDepth(point.y+70);
   this.sites.push({...point,points,sprite,label});
  }
 }
 private reachable(x:number,y:number){
  const world=this.s.world;let start={x,y};
  if(world.blocked(x,y,22))for(let i=0;i<150;i++){const a=i*2.4,r=24+Math.floor(i/10)*16,p={x:x+Math.cos(a)*r,y:y+Math.sin(a)*r};if(!world.blocked(p.x,p.y,22)){start=p;break}}
  const queue=[{...start,gx:0,gy:0}],seen=new Set(['0,0']),nodes:{x:number;y:number}[]=[];
  for(let i=0;i<queue.length&&i<4000;i++){
   const n=queue[i];if(CAMPS.every(c=>Math.hypot(n.x-c.x,n.y-c.y)>170)&&BEACONS.every(b=>Math.hypot(n.x-b.x,n.y-b.y)>120))nodes.push({x:n.x,y:n.y});
   for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const gx=n.gx+dx,gy=n.gy+dy,key=gx+','+gy,p={gx,gy,x:start.x+gx*24,y:start.y+gy*24};if(seen.has(key)||Math.hypot(p.x-x,p.y-y)>420)continue;seen.add(key);if(world.blocked(p.x,p.y,22)||world.blocked((n.x+p.x)/2,(n.y+p.y)/2,22))continue;queue.push(p)}
  }const open=nodes.filter(n=>world.obstacles.every(o=>Math.hypot(n.x-o.x,n.y-o.y)>o.r+60));return open.length>12?open:nodes.length?nodes:[start];
 }
 get completed(){return SITES.filter((_,i)=>this.s.cleared.has('discovery-'+i)).length}
 reset(){this.active=-1;this.step=0;this.remaining=0;this.graphics.clear();this.sites.forEach((site,i)=>site.label.setText(SITES[i].name))}
 interaction(){const p=this.s.player;for(let i=0;i<this.sites.length;i++){const site=this.sites[i];if(this.active===i)return null;if(!this.s.cleared.has('discovery-'+i)&&Math.hypot(p.x-site.x,p.y-site.y)<75)return{kind:'discovery',index:i,text:this.active===i?'Desafio em andamento':`E · ${SITES[i].kind==='cache'?'Abrir': 'Iniciar'} ${SITES[i].name}`}}return null}
 interact(i:number){
  if(this.active>=0)return;
  const spec=SITES[i],site=this.sites[i];if(!spec||this.s.cleared.has('discovery-'+i))return;
  if(spec.kind==='cache'){this.reward(i);return}
  this.active=i;this.step=0;this.remaining=spec.kind==='trail'?9:0;
  if(spec.kind==='ambush'){
   for(let j=0;j<(this.s.difficulty==='easy'?2:3);j++){const id=`secret-${i}-${j}`;if(this.s.cleared.has(id))continue;const p=site.points[j];if(!this.s.enemies.some(e=>e.id===id)){const e=this.s.spawn(j%2?'rattata':'zubat',p.x,p.y,REGIONS[2].level,id,2);e.aggro=true;e.appear=.5;if(j===0){e.scale=1.45;e.sprite.setScale(1.45);e.maxHp=Math.round(e.maxHp*2.4);e.hp=e.maxHp;e.damage=Math.round(e.damage*1.25);e.xp=Math.round(e.xp*1.6)}}}
   this.s.onNotice('NINHO DESPERTADO','Derrote os habitantes para abrir o baú.');
  }else this.s.onNotice('3 CÍRCULOS · 9 SEGUNDOS','Atravesse os três círculos dourados em 9 segundos.');
 }
 private reward(i:number){
  if(this.s.cleared.has('discovery-'+i))return;
  const spec=SITES[i],site=this.sites[i];this.s.cleared.add('discovery-'+i);this.active=-1;
  const reward=this.s.add.text(site.x,site.y-35,`+${spec.xp} XP · +30 HP${i===3?' · +1 ponto':''}`,{fontSize:'16px',color:'#ffe5a0',stroke:'#183f30',strokeThickness:4}).setOrigin(.5).setDepth(9200);this.s.tweens.add({targets:reward,y:site.y-95,alpha:0,duration:1800,onComplete:()=>reward.destroy()});this.s.gainXP(spec.xp);this.s.player.hp=Math.min(this.s.player.maxHp,this.s.player.hp+30);if(i===3)this.s.progress.points++;
  this.s.combat.burst(site.x,site.y,35,0xffde85);this.s.audio.play('checkpoint');this.s.onNotice(spec.name.toUpperCase(),`+${spec.xp} XP · +30 de vida${i===3?' · +1 ponto de habilidade':''}`);this.s.save();this.s.onChange();
 }
 update(dt:number){
  const p=this.s.player,g=this.graphics;g.clear();
  for(let i=0;i<this.sites.length;i++){
   const site=this.sites[i],done=this.s.cleared.has('discovery-'+i),distance=Math.hypot(p.x-site.x,p.y-site.y);site.sprite.setVisible(!done&&distance<800);site.label.setVisible(!done&&distance<210);
   if(!done&&distance<450)g.lineStyle(1,0xffd785,.5).strokeCircle(site.x,site.y+16,25+Math.sin(this.s.clock*2)*3);
  }
  if(this.active<0)return;
  const i=this.active,site=this.sites[i],spec=SITES[i];
  if(Math.hypot(p.x-site.x,p.y-site.y)>450){this.cancel();return}
  if(spec.kind==='trail'){
   this.remaining-=dt;if(this.remaining<=0){this.cancel();return}
   const point=site.points[this.step];g.lineStyle(4,0xffde8f,.9).strokeCircle(point.x,point.y,33);g.fillStyle(0xffe2a0,.13).fillCircle(point.x,point.y,33);
   site.label.setText(`${this.step}/3 · ${Math.ceil(this.remaining)}s`).setVisible(true);
   if(Math.hypot(p.x-point.x,p.y-point.y)<32){this.step++;this.s.audio.play('pickup');if(this.step===3)this.reward(i)}
  }else if(!this.s.enemies.some(e=>e.id.startsWith(`secret-${i}-`)))this.reward(i);
 }
 private cancel(){const i=this.active;this.reset();if(i>=0)this.sites[i].label.setText(SITES[i].name);this.s.onNotice('DESAFIO INTERROMPIDO','Volte ao baú para tentar novamente.');}
}
