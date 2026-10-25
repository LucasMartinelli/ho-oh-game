import Phaser from 'phaser';
import type {BattleScene} from './scene';
import type {Enemy} from './actors';
export type AttackPhase='idle'|'windup'|'active'|'recover';
export interface AttackState {phase:AttackPhase;time:number;duration:number;angle:number;tx:number;ty:number;pattern:string;turn:number;fired:boolean}
export const freshAttack=():AttackState=>({phase:'idle',time:.7,duration:0,angle:0,tx:0,ty:0,pattern:'',turn:0,fired:false});

/** Locked telegraphs: the attack never follows the player after the warning. */
export class Encounters {
 readonly graphics:Phaser.GameObjects.Graphics;
 constructor(private scene:BattleScene){this.graphics=scene.add.graphics().setDepth(9000)}
 clear(){this.graphics.clear()}
 reset(e:Enemy){e.attack=freshAttack()}
 update(e:Enemy,dt:number):{x:number;y:number}|null {
  const s=this.scene,p=s.player,a=e.attack,easy=s.difficulty==='easy',phase2=e.boss&&e.hp<e.maxHp*.5;
  const supported=e.boss||['squirtle','bulbasaur','rattata'].includes(e.species);
  if(!supported)return null;
  a.time-=dt;
  if(a.phase==='idle'){
   if(a.time>0||Math.hypot(e.x-p.x,e.y-p.y)>(e.species==='rattata'?220:430)||!s.world.lineClear(e.x,e.y,p.x,p.y))return null;
   a.angle=Math.atan2(p.y-e.y,p.x-e.x);a.tx=p.x;a.ty=p.y;a.fired=false;
   const patterns:Record<string,string[]>={rattata:['dash'],squirtle:['jet'],bulbasaur:['roots'],charizard:['fan','dash'],blastoise:['jet','fan'],venusaur:['roots','ring'],dragonite:['dash','ring']};
   a.pattern=patterns[e.species][a.turn++%patterns[e.species].length];
   a.phase='windup';a.time=a.duration=(easy?1.15:.85)*(phase2?.9:1);if(a.pattern==='roots')a.time=a.duration=easy?1.5:1.1;
  }
  if(a.phase==='windup'){
   this.warning(e,a.time/a.duration);
   if(a.time>0)return{x:0,y:0};
   a.phase='active';a.time=a.pattern==='dash'?.55:a.pattern==='jet'?.65:.12;a.fired=false;
  }
  if(a.phase==='active'){
   if(!a.fired){a.fired=true;this.fire(e,phase2)}
   if(a.time<=0){a.phase='recover';a.time=easy?1.9:1.3;return{x:0,y:0}}
   if(a.pattern==='dash'){const speed=e.boss?(easy?240:340):(easy?150:230);return{x:Math.cos(a.angle)*speed/e.speed,y:Math.sin(a.angle)*speed/e.speed}}
   return{x:0,y:0};
  }
  if(a.phase==='recover'){
   this.graphics.lineStyle(2,0x91e3cb,.75).strokeCircle(e.x,e.y,e.r+12);
   if(a.time<=0){a.phase='idle';a.time=e.boss?(easy?1.2:.65):(easy?2.2:1.2)}
   return{x:0,y:0};
  }
  return null;
 }
 private warning(e:Enemy,progress:number){
  const a=e.attack,g=this.graphics,color=a.pattern==='roots'?0xffc27a:e.species==='squirtle'||e.species==='blastoise'?0x91e5ff:0xffbe72;
  const pulse=.45+.2*Math.sin(this.scene.clock*14);g.lineStyle(3,color,.9).fillStyle(color,.10+(1-progress)*.12);
  if(a.pattern==='roots'){const radius=e.boss?100:55;g.fillCircle(a.tx,a.ty,radius).strokeCircle(a.tx,a.ty,radius);g.lineStyle(2,color,pulse).strokeCircle(a.tx,a.ty,radius*(1-progress));return}
  if(a.pattern==='ring'){
   // The gap points toward the locked player position: stay in it or dodge outward.
   for(let i=2;i<11;i++){const angle=a.angle+i*Math.PI/6;g.lineBetween(e.x+Math.cos(angle)*55,e.y+Math.sin(angle)*55,e.x+Math.cos(angle)*200,e.y+Math.sin(angle)*200)}
   return;
  }
  const reach=a.pattern==='dash'?(e.boss?190:135):300,width=a.pattern==='fan'?.4:.08;
  for(const offset of [-width,width]){const angle=a.angle+offset;g.lineBetween(e.x,e.y,e.x+Math.cos(angle)*reach,e.y+Math.sin(angle)*reach)}
  g.fillTriangle(e.x,e.y,e.x+Math.cos(a.angle-width)*reach,e.y+Math.sin(a.angle-width)*reach,e.x+Math.cos(a.angle+width)*reach,e.y+Math.sin(a.angle+width)*reach);
  g.lineStyle(3,color,pulse).strokeCircle(e.x,e.y,e.r+9);
 }
 private fire(e:Enemy,phase2:boolean){
  const s=this.scene,a=e.attack;
  if(a.pattern==='dash'){s.audio.play('dash');return}
  if(a.pattern==='roots'){
   const radius=e.boss?100:55;s.combat.burst(a.tx,a.ty,e.boss?32:15,0xb9e779);
   if(Math.hypot(s.player.x-a.tx,s.player.y-a.ty)<radius+s.player.r&&s.world.lineClear(e.x,e.y,s.player.x,s.player.y))s.hurt(e.damage);
   const ring=s.add.circle(a.tx,a.ty,radius,0x9ac568,.28).setStrokeStyle(3,0xd2ee9c).setDepth(8900);s.tweens.add({targets:ring,alpha:0,duration:420,onComplete:()=>ring.destroy()});return;
  }
  const type=['squirtle','blastoise'].includes(e.species)?'water':e.species==='venusaur'?'leaf':'fire';
  const shoot=(angle:number,speed:number)=>s.combat.shoot(e.x+Math.cos(angle)*(e.r+10),e.y+Math.sin(angle)*(e.r+10),angle,true,type,e.damage,speed*s.rules.projectile);
  if(a.pattern==='ring'){for(let i=2;i<11;i++)shoot(a.angle+i*Math.PI/6,phase2?235:195)}
  else if(a.pattern==='fan'){const count=phase2&&s.difficulty==='hard'?5:3;for(let i=0;i<count;i++)shoot(a.angle+(i-(count-1)/2)*(.8/(count-1)),210)}
  else {for(let i=0;i<(e.boss?3:1);i++)shoot(a.angle,180+i*40)}
  s.combat.burst(e.x,e.y,8,type==='water'?0x91dfff:0xffbe72);
 }
}
