import Phaser from 'phaser';
import {Actor} from './actors';
import type {BattleScene} from './scene';
import {CAMPS} from './adventure';
export const LUGIA_POINT={x:3100,y:4900};
/** Follows Ho-Oh's traversable trail instead of cutting across coastlines. */
export class Companion {
 actor:Actor;private trail:{x:number;y:number}[]=[];private cooldown=0;private beam=0;private from={x:0,y:0};private to={x:0,y:0};private stuck=0;private effects:Phaser.GameObjects.Graphics;private nameTag:Phaser.GameObjects.Text;private wing=0;private lean=0;
 constructor(private scene:BattleScene){this.actor=new Actor(scene,LUGIA_POINT.x,LUGIA_POINT.y,'lugia',1.12);this.actor.r=15;this.effects=scene.add.graphics().setDepth(9050);this.nameTag=scene.add.text(LUGIA_POINT.x,LUGIA_POINT.y-85,'LUGIA · GUARDIÃO DOS MARES',{fontSize:'14px',color:'#d6f3ff',stroke:'#183843',strokeThickness:4}).setOrigin(.5).setDepth(9051)}
 reset(){this.trail=[];this.cooldown=.5;this.beam=0;this.effects.clear();this.stuck=0;this.lean=0;this.actor.sprite.setRotation(0);const p=this.scene.lugia?this.scene.player:LUGIA_POINT;this.actor.x=p.x;this.actor.y=p.y;if(this.scene.lugia){for(let i=0;i<12;i++){const angle=Math.PI+i*Math.PI/6,x=p.x+Math.cos(angle)*110,y=p.y+Math.sin(angle)*110;if(!this.scene.world.blocked(x,y,this.actor.r)&&this.scene.world.lineClear(p.x,p.y,x,y)){this.actor.x=x;this.actor.y=y;break}}}this.nameTag.setVisible(!this.scene.lugia);this.actor.render(this.scene.clock)}
 update(dt:number){const s=this.scene,p=s.player,a=this.actor;this.effects.clear();
  if(!s.lugia){a.x=LUGIA_POINT.x;a.y=LUGIA_POINT.y;a.sprite.setVisible(Math.hypot(a.x-p.x,a.y-p.y)<850);a.shadow.setVisible(a.sprite.visible);this.nameTag.setVisible(a.sprite.visible);a.render(s.clock,dt);this.effects.lineStyle(2,0xb9ebef,.45).strokeCircle(a.x,a.y+20,62+Math.sin(s.clock*2)*3);return}
  if(!s.lugiaActive){a.sprite.setVisible(false);a.shadow.setVisible(false);this.nameTag.setVisible(false);return}
  a.sprite.setVisible(true);a.shadow.setVisible(true);this.nameTag.setVisible(false);
  if(Math.hypot(a.x-p.x,a.y-p.y)>650||this.stuck>2){s.combat.burst(a.x,a.y,12,0xb4e7fa);this.reset();s.combat.burst(a.x,a.y,12,0xb4e7fa)}
  const last=this.trail[this.trail.length-1]??a;if(Math.hypot(last.x-p.x,last.y-p.y)>12)this.trail.push({x:p.x,y:p.y});if(this.trail.length>180)this.trail.splice(0,this.trail.length-180);
  const px0=a.x,py0=a.y;
  if(this.trail.length>9){const q=this.trail[0],d=Math.hypot(q.x-a.x,q.y-a.y);if(d<6)this.trail.shift();else{const step=Math.min(d,(Math.hypot(a.x-p.x,a.y-p.y)>180?480:300)*dt),x=a.x,y=a.y;s.world.move(a,(q.x-a.x)/d*step,(q.y-a.y)/d*step);a.sprite.setFlipX(q.x>a.x);this.stuck=Math.hypot(a.x-x,a.y-y)<.1?this.stuck+dt:0}}
  const vxNow=(a.x-px0)/Math.max(dt,.001),spd=Math.hypot(a.x-px0,a.y-py0)/Math.max(dt,.001);
  this.wing+=dt*(1+Math.min(spd/400,1)*1.1);this.lean+=(vxNow*.00022-this.lean)*(1-Math.exp(-dt*6));a.sprite.setRotation(this.lean);
  a.render(this.wing,dt);this.cooldown-=dt;this.beam=Math.max(0,this.beam-dt);
  const safe=CAMPS.some(c=>Math.hypot(c.x-p.x,c.y-p.y)<125);
  if(this.cooldown<=0&&!safe){const target=s.enemies.filter(e=>e.aggro&&Math.hypot(e.x-p.x,e.y-p.y)<460&&Math.hypot(e.x-a.x,e.y-a.y)<350&&s.world.lineClear(a.x,a.y,e.x,e.y)).sort((e,f)=>Number(s.flame.contains(f.x,f.y,f.r,s.world))-Number(s.flame.contains(e.x,e.y,e.r,s.world))||Math.hypot(e.x-a.x,e.y-a.y)-Math.hypot(f.x-a.x,f.y-a.y))[0];if(target){this.cooldown=.95;this.beam=.22;this.from={x:a.x,y:a.y-8};this.to={x:target.x,y:target.y};a.sprite.setFlipX(target.x>a.x);a.squash=-.18;s.combat.burst(a.x,a.y-8,6,0xcfeeff);s.combat.burst(target.x,target.y,12,0xafe7f7);s.audio.play('aeroblast');s.damage(target,30+s.progress.level*2,55)}}
  if(this.beam>0){const alpha=Math.min(1,this.beam/.22);this.effects.lineStyle(14,0x78cde7,alpha*.25).lineBetween(this.from.x,this.from.y,this.to.x,this.to.y);this.effects.lineStyle(4,0xe6fbff,alpha).lineBetween(this.from.x,this.from.y,this.to.x,this.to.y);for(let i=1;i<5;i++){const t=i/5,x=this.from.x+(this.to.x-this.from.x)*t,y=this.from.y+(this.to.y-this.from.y)*t;this.effects.lineStyle(2,0xb4eaf7,alpha*.8).strokeCircle(x,y,7+(1-alpha)*14)}}
 }
 strike(x:number,y:number){this.beam=.35;this.from={x:this.actor.x,y:this.actor.y-8};this.to={x,y};this.actor.squash=-.22}
}
