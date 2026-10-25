import Phaser from 'phaser';
import sheets from './hooh-data.json';
import type {Player} from './actors';

export function preloadHooh(scene:Phaser.Scene){
 for(const [name,s] of Object.entries(sheets))scene.load.spritesheet(`hooh-${name}`,s.data,{frameWidth:s.width,frameHeight:s.height});
}

/** PMD rows: S, SE, E, NE, N, NW, W, SW. Physics never uses visual offsets. */
export class HoohFlight {
 direction=6;frame=0;state:'Idle'|'Walk'|'Shoot'='Idle';
 private time=0;private bank=0;
 render(p:Player,dt:number,mx:number,my:number,firing:boolean,reduced:boolean,dx=p.dx,dy=p.dy){
  const angle=Math.atan2(dy,dx),current=Math.PI/2-this.direction*Math.PI/4;
  const difference=Math.atan2(Math.sin(angle-current),Math.cos(angle-current));
  // Small hysteresis prevents mouse/analog jitter at the boundary of two poses.
  if(Math.abs(difference)>Math.PI/8+.055)this.direction=((Math.round((Math.PI/2-angle)/(Math.PI/4))%8)+8)%8;
  const state=firing?'Shoot':Math.hypot(mx,my)>.01||p.dashTime>0?'Walk':'Idle';
  if(state!==this.state){this.state=state;this.time=0}
  const sheet=sheets[this.state],sequence=sheet.sequence,total=sequence.reduce((sum,i)=>sum+sheet.durations[i],0);
  this.time=(this.time+dt*(p.dashTime>0?1.6:1))%total;
  let remaining=this.time;this.frame=sequence[sequence.length-1];
  for(const frame of sequence){if(remaining<sheet.durations[frame]){this.frame=frame;break}remaining-=sheet.durations[frame]}
  const point=sheet.points[this.direction][this.frame];
  this.bank+=((firing?0:mx*.035)-this.bank)*(1-Math.exp(-dt*10));
  p.sprite.setTexture(`hooh-${this.state}`,this.direction*sheet.frames+this.frame)
   .setOrigin(point.center[0]/sheet.width,point.center[1]/sheet.height)
   .setFlipX(false).setRotation(reduced?0:this.bank).setScale(p.scale);
 }
 mouth(p:Player){
  const point=sheets[this.state].points[this.direction][this.frame];
  const x=(point.mouth[0]-point.center[0])*p.sprite.scaleX,y=(point.mouth[1]-point.center[1])*p.sprite.scaleY;
  const c=Math.cos(p.sprite.rotation),s=Math.sin(p.sprite.rotation);
  return{x:p.sprite.x+x*c-y*s,y:p.sprite.y+x*s+y*c};
 }
 reset(){this.time=0;this.bank=0;this.state='Idle'}
}
