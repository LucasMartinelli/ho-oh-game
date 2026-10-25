import Phaser from 'phaser';
import {WORLD} from './world';
/** Deadzone focus is independent of the sprite's cosmetic flight bob. */
export class FlightCamera {
 private x=1920;private y=2470;private fx=1920;private fy=2470;private lx=0;private ly=0;
 constructor(private camera:Phaser.Cameras.Scene2D.Camera){camera.stopFollow();camera.setBounds(0,0,WORLD.w,WORLD.h)}
 snap(x:number,y:number){this.x=this.fx=x;this.y=this.fy=y;this.lx=this.ly=0;this.camera.centerOn(x,y)}
 update(x:number,y:number,dx:number,dy:number,dt:number,reduced=false,ax=0,ay=0,bx?:number,by?:number){
  if(Math.hypot(x-this.fx,y-this.fy)>800){this.snap(x,y);return}
  this.fx+=Math.sign(x-this.fx)*Math.max(0,Math.abs(x-this.fx)-35);this.fy+=Math.sign(y-this.fy)*Math.max(0,Math.abs(y-this.fy)-25);
  const lead=reduced?0:48,a=1-Math.exp(-dt*4);this.lx+=(dx*lead+ax*60-this.lx)*a;this.ly+=(dy*lead+ay*60-this.ly)*a;
  let targetX=Phaser.Math.Clamp(this.fx+this.lx,this.camera.width/2,WORLD.w-this.camera.width/2),targetY=Phaser.Math.Clamp(this.fy+this.ly,this.camera.height/2,WORLD.h-this.camera.height/2);
  if(bx!==undefined&&by!==undefined){targetX+=(bx-targetX)*.3;targetY+=(by-targetY)*.3}
  const smooth=1-Math.exp(-dt*7);
  this.x+=(targetX-this.x)*smooth;this.y+=(targetY-this.y)*smooth;this.camera.centerOn(this.x,this.y)
 }
}
