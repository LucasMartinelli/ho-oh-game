import Phaser from 'phaser';
import type {BattleScene} from './scene';
import type {Enemy} from './actors';
export type AttackPhase='idle'|'windup'|'active'|'recover';
export interface AttackState {phase:AttackPhase;time:number;duration:number;angle:number;tx:number;ty:number;pattern:string;turn:number;fired:boolean;fired2:boolean;aux:number}
export const freshAttack=():AttackState=>({phase:'idle',time:.7,duration:0,angle:0,tx:0,ty:0,pattern:'',turn:0,fired:false,fired2:false,aux:0});
export interface Zone {x:number;y:number;r:number;tele:number;life:number;dmg:number;kind:string;push?:{x:number;y:number}}
const ZONE_STYLE:Record<string,{line:number;fill:number}>={spore:{line:0xcfe6a0,fill:0x9fc36e},vent:{line:0xffb26e,fill:0xf07f3c},flame:{line:0xffb26e,fill:0xf07f3c},current:{line:0x9adbe8,fill:0x58aec4},gust:{line:0xe8f0f2,fill:0xb8ccd4}};
export const HAZARD_SPEC:Record<string,{r:number;tele:number;life:number;dmg:number;idle:number;push?:number}>={spore:{r:70,tele:.9,life:3,dmg:8,idle:6},vent:{r:55,tele:1.1,life:1.2,dmg:16,idle:4.5},current:{r:85,tele:.6,life:2.4,dmg:0,idle:4,push:110},gust:{r:90,tele:.8,life:1.5,dmg:0,idle:5,push:165}};

/** Locked telegraphs: the attack never follows the player after the warning. */
export class Encounters {
 readonly graphics:Phaser.GameObjects.Graphics;
 zones:Zone[]=[];
 constructor(private scene:BattleScene){this.graphics=scene.add.graphics().setDepth(9000)}
 clear(){this.graphics.clear()}
 clearZones(){this.zones=[]}
 reset(e:Enemy){e.attack=freshAttack()}
 spawnZone(x:number,y:number,r:number,tele:number,life:number,dmg:number,kind:string,push?:{x:number;y:number}){if(this.zones.length>14)this.zones.shift();this.zones.push({x,y,r,tele,life,dmg,kind,push})}
 updateZones(dt:number){
  const s=this.scene,p=s.player,g=this.graphics;
  for(let i=this.zones.length-1;i>=0;i--){const z=this.zones[i],st=ZONE_STYLE[z.kind]??ZONE_STYLE.vent;
   if(z.tele>0){z.tele-=dt;const k=1-z.tele;g.lineStyle(2,st.line,.7).strokeCircle(z.x,z.y,z.r);g.fillStyle(st.fill,.08).fillCircle(z.x,z.y,z.r);g.lineStyle(1,st.line,.5).strokeCircle(z.x,z.y,z.r*k)}
   else{z.life-=dt;g.lineStyle(2,st.line,.5+Math.sin(s.clock*10)*.15).strokeCircle(z.x,z.y,z.r);g.fillStyle(st.fill,.16).fillCircle(z.x,z.y,z.r);
    if(z.push){g.lineStyle(2,st.line,.4).lineBetween(z.x,z.y,z.x+z.push.x*z.r,z.y+z.push.y*z.r);if(Math.hypot(p.x-z.x,p.y-z.y)<z.r)s.world.move(p,z.push.x*dt,z.push.y*dt)}
    else if(Math.hypot(p.x-z.x,p.y-z.y)<z.r+p.r&&s.world.lineClear(z.x,z.y,p.x,p.y))s.hurt(z.dmg)}
   if(z.life<=0)this.zones.splice(i,1)}
 }
 update(e:Enemy,dt:number):{x:number;y:number}|null {
  const s=this.scene,p=s.player,a=e.attack,easy=s.difficulty==='easy',phase2=e.boss&&e.hp<e.maxHp*.5;
  const supported=e.boss||['squirtle','bulbasaur','rattata','pidgey','zubat'].includes(e.species);
  if(!supported)return null;
  a.time-=dt;
  if(a.phase==='idle'){
   const d=Math.hypot(e.x-p.x,e.y-p.y);
   if(a.time>0||d>(e.species==='rattata'?220:430)||!s.world.lineClear(e.x,e.y,p.x,p.y))return null;
   a.angle=Math.atan2(p.y-e.y,p.x-e.x);a.tx=p.x;a.ty=p.y;a.fired=false;
   const patterns:Record<string,string[]>={rattata:['dash'],squirtle:['jet'],bulbasaur:['roots'],pidgey:['gust'],zubat:['sonic'],charizard:['fan','dash'],blastoise:['jet','fan'],venusaur:['roots','ring'],dragonite:['dash','ring']};
   const signatures:Record<string,string[]>={venusaur:['spores'],blastoise:['hydro'],charizard:['trail'],dragonite:['combo']};
   const list=phase2&&signatures[e.species]?[...patterns[e.species],...signatures[e.species]]:patterns[e.species];
   a.pattern=list[a.turn++%list.length];
   if(d>290&&list.includes('dash'))a.pattern='dash';
   if(a.pattern===e.lastPattern)e.patternRun++;else{e.patternRun=0;e.lastPattern=a.pattern}
   if(e.patternRun>=2&&list.length>1){a.pattern=list.find(q=>q!==a.pattern)??a.pattern;e.lastPattern=a.pattern;e.patternRun=0}
   const warningTime=a.pattern==='roots'?(easy?1.5:1.1):(easy?1.15:.85)*(phase2?.9:1);
   a.phase='windup';a.time=a.duration=warningTime*(s.assist.telegraph?1.3:1);
   e.sprite.setFlipX(Math.cos(a.angle)>0);
   const pan=Phaser.Math.Clamp((e.x-p.x)/400,-1,1);s.audio.play('warn-'+a.pattern,pan);s.tip('telegraph','ATAQUE ANUNCIADO','Áreas marcadas não seguem você: saia do caminho.');
  }
  if(a.phase==='windup'){
   this.warning(e,a.time/a.duration);
   const w=1-Math.max(0,a.time)/a.duration;e.squash=.22*w;e.tremble=.06;
   if(a.time>0)return{x:-Math.cos(a.angle)*.26*(1-w),y:-Math.sin(a.angle)*.26*(1-w)};
   a.phase='active';a.time=a.pattern==='dash'||a.pattern==='trail'||a.pattern==='combo'?.55:a.pattern==='jet'?.65:a.pattern==='hydro'?.9:a.pattern==='ring'&&phase2?.75:.12;a.fired=false;a.fired2=false;a.aux=0;e.squash=-.3;e.tremble=.1;
  }
  if(a.phase==='active'){
   if(!a.fired){a.fired=true;this.fire(e,phase2)}
   if(a.pattern==='ring'&&phase2&&!a.fired2&&a.time<=.4){a.fired2=true;this.shootRing(e,a.angle-(a.turn%2?1:-1)*Math.PI/2,235)}
   if(a.pattern==='hydro')this.beamSweep(e);
   a.aux-=dt;
   if(a.pattern==='trail'&&a.aux<=0){a.aux=.08;this.spawnZone(e.x,e.y,24,.2,2,10,'flame')}
   if(a.pattern==='combo'&&a.time<=0&&!a.fired2){a.fired2=true;this.shootRing(e,a.angle+Math.PI/2,215);a.time=.35;return{x:0,y:0}}
   if(a.time<=0){a.phase='recover';a.time=easy?1.9:1.3;if(e.boss)s.tip('recover','JANELA DE VULNERABILIDADE','Círculo verde: o guardião recebe +35% de dano.');return{x:0,y:0}}
   if(a.pattern==='dash'||a.pattern==='trail'||a.pattern==='combo'){const speed=e.boss?(easy?240:340):(easy?150:230);return{x:Math.cos(a.angle)*speed/e.speed,y:Math.sin(a.angle)*speed/e.speed}}
   return{x:0,y:0};
  }
  if(a.phase==='recover'){
   this.graphics.lineStyle(2,0x91e3cb,.75).strokeCircle(e.x,e.y,e.r+12);
   if(a.time<=0){a.phase='idle';a.time=e.boss?(easy?1.2:.65):(easy?2.2:1.2)}
   return{x:0,y:0};
  }
  return null;
 }
 private beamSweep(e:Enemy){
  const s=this.scene,a=e.attack,g=this.graphics;
  const ang=a.angle-.75+1.5*(1-a.time/.9);
  g.lineStyle(26,0x7fd4ec,.3).lineBetween(e.x,e.y,e.x+Math.cos(ang)*340,e.y+Math.sin(ang)*340);
  g.lineStyle(8,0xe0f7ff,.8).lineBetween(e.x,e.y,e.x+Math.cos(ang)*340,e.y+Math.sin(ang)*340);
  const p=s.player,pa=Math.atan2(p.y-e.y,p.x-e.x),diff=Math.atan2(Math.sin(pa-ang),Math.cos(pa-ang));
  if(Math.abs(diff)<.12&&Math.hypot(p.x-e.x,p.y-e.y)<340+p.r&&s.world.lineClear(e.x,e.y,p.x,p.y))s.hurt(e.damage);
 }
 private warning(e:Enemy,progress:number){
  const a=e.attack,g=this.graphics,color=a.pattern==='roots'||a.pattern==='spores'?0xffc27a:e.species==='squirtle'||e.species==='blastoise'?0x91e5ff:0xffbe72;
  const pulse=.45+.2*Math.sin(this.scene.clock*14);g.lineStyle(3,color,.9).fillStyle(color,.10+(1-progress)*.12);
  if(a.pattern==='roots'){const radius=e.boss?100:55;g.fillCircle(a.tx,a.ty,radius).strokeCircle(a.tx,a.ty,radius);g.lineStyle(2,color,pulse).strokeCircle(a.tx,a.ty,radius*(1-progress));return}
  if(a.pattern==='spores'){for(const side of [1,-1]){const x=e.x+Math.cos(a.angle+side*Math.PI/2)*140,y=e.y+Math.sin(a.angle+side*Math.PI/2)*140;g.fillCircle(x,y,60).strokeCircle(x,y,60);g.lineStyle(2,color,pulse).strokeCircle(x,y,60*(1-progress))}return}
  if(a.pattern==='ring'||a.pattern==='sonic'){
   // The gap sits 90° to one side, alternating per turn; phase-2 bosses show a
   // faint second volley with the opposite gap. Sideways movement is required.
   const side=a.turn%2?1:-1,phase2=e.boss&&e.hp<e.maxHp*.5&&a.pattern==='ring';
   for(const [gap,alpha] of [[a.angle+side*Math.PI/2,.85],...(phase2?[[a.angle-side*Math.PI/2,.35]]:[])] as [number,number][]){
    g.lineStyle(2,color,alpha);const reach=a.pattern==='sonic'?140:200,start=a.pattern==='sonic'?40:55;
    for(let i=2;i<11;i++){const angle=gap+i*Math.PI/6;g.lineBetween(e.x+Math.cos(angle)*start,e.y+Math.sin(angle)*start,e.x+Math.cos(angle)*reach,e.y+Math.sin(angle)*reach)}
   }
   return;
  }
  if(a.pattern==='hydro'){const reach=340;g.lineStyle(3,color,.8);g.strokeTriangle(e.x,e.y,e.x+Math.cos(a.angle-.8)*reach,e.y+Math.sin(a.angle-.8)*reach,e.x+Math.cos(a.angle+.8)*reach,e.y+Math.sin(a.angle+.8)*reach);g.lineStyle(2,color,pulse).lineBetween(e.x,e.y,e.x+Math.cos(a.angle-.8)*reach,e.y+Math.sin(a.angle-.8)*reach);g.lineBetween(e.x,e.y,e.x+Math.cos(a.angle+.8)*reach,e.y+Math.sin(a.angle+.8)*reach);return}
  const reach=a.pattern==='dash'||a.pattern==='trail'||a.pattern==='combo'?(e.boss?190:135):300,width=a.pattern==='fan'||a.pattern==='gust'?.4:.08;
  for(const offset of [-width,width]){const angle=a.angle+offset;g.lineBetween(e.x,e.y,e.x+Math.cos(angle)*reach,e.y+Math.sin(angle)*reach)}
  g.fillTriangle(e.x,e.y,e.x+Math.cos(a.angle-width)*reach,e.y+Math.sin(a.angle-width)*reach,e.x+Math.cos(a.angle+width)*reach,e.y+Math.sin(a.angle+width)*reach);
  g.lineStyle(3,color,pulse).strokeCircle(e.x,e.y,e.r+9);
 }
 private fire(e:Enemy,phase2:boolean){
  const s=this.scene,a=e.attack,pan=Phaser.Math.Clamp((e.x-s.player.x)/400,-1,1);
  if(a.pattern==='dash'||a.pattern==='trail'||a.pattern==='combo'){s.audio.play('dash',pan);return}
  if(a.pattern==='roots'){
   s.audio.play('roots',pan);const radius=e.boss?100:55;s.combat.burst(a.tx,a.ty,e.boss?32:15,0xb9e779);
   if(Math.hypot(s.player.x-a.tx,s.player.y-a.ty)<radius+s.player.r&&s.world.lineClear(e.x,e.y,s.player.x,s.player.y))s.hurt(e.damage);
   const ring=s.add.circle(a.tx,a.ty,radius,0x9ac568,.28).setStrokeStyle(3,0xd2ee9c).setDepth(8900);s.tweens.add({targets:ring,alpha:0,duration:420,onComplete:()=>ring.destroy()});return;
  }
  if(a.pattern==='spores'){for(const side of [1,-1])this.spawnZone(e.x+Math.cos(a.angle+side*Math.PI/2)*140,e.y+Math.sin(a.angle+side*Math.PI/2)*140,60,.9,4,8,'spore');s.combat.burst(e.x,e.y,16,0xcfe6a0);s.audio.play('spores',pan);return}
  if(a.pattern==='hydro'){s.audio.play('wave',pan);return}
  const type=['squirtle','blastoise'].includes(e.species)?'water':e.species==='venusaur'?'leaf':e.species==='pidgey'||e.species==='zubat'?'gust':'firebolt';
  const shoot=(angle:number,speed:number)=>s.combat.shoot(e.x+Math.cos(angle)*(e.r+10),e.y+Math.sin(angle)*(e.r+10),angle,true,type,e.damage,speed*s.rules.projectile);
  if(a.pattern==='ring'){this.shootRing(e,a.angle+(a.turn%2?1:-1)*Math.PI/2,195)}
  else if(a.pattern==='sonic'){const gap=a.angle+Math.PI/2;for(let i=1;i<8;i++)shoot(gap+i*Math.PI/4,150)}
  else if(a.pattern==='gust'){for(const off of [-.18,.18])shoot(a.angle+off,190)}
  else if(a.pattern==='fan'){const count=phase2&&s.difficulty==='hard'?5:3;for(let i=0;i<count;i++)shoot(a.angle+(i-(count-1)/2)*(.8/(count-1)),210)}
  else {for(let i=0;i<(e.boss?3:1);i++)shoot(a.angle,180+i*40)}
  s.combat.burst(e.x,e.y,8,type==='water'?0x91dfff:0xffbe72);s.audio.play('shot-'+type,pan);
 }
 private shootRing(e:Enemy,gap:number,speed:number){
  const s=this.scene,type=e.species==='venusaur'?'leaf':'firebolt';
  for(let i=2;i<11;i++){const angle=gap+i*Math.PI/6;s.combat.shoot(e.x+Math.cos(angle)*(e.r+10),e.y+Math.sin(angle)*(e.r+10),angle,true,type,e.damage,speed*s.rules.projectile)}
 }
}
