import Phaser from 'phaser';
import {World} from './world';
/** A short-range, occluded continuous jet. Damage is handled by the same cone in the scene. */
export class Flame {
 graphics:Phaser.GameObjects.Graphics;glow:Phaser.GameObjects.Image;active=false;x=0;y=0;angle=0;range=0;spread=.25;
 private particles:{s:Phaser.GameObjects.Image;x:number;y:number;vx:number;vy:number;life:number;max:number;size:number}[]=[];private accumulator=0;
 constructor(private scene:Phaser.Scene){this.graphics=scene.add.graphics().setDepth(9000);this.glow=scene.add.image(0,0,'glow').setBlendMode(Phaser.BlendModes.ADD).setDepth(8999).setVisible(false)}
 update(dt:number,t:number,active:boolean,x:number,y:number,angle:number,range:number,world:World){
  Object.assign(this,{active,x,y,angle,range:world.ray(x,y,angle,range)});this.graphics.clear();this.glow.setVisible(active);
  if(active){
   const d=this.range,dx=Math.cos(angle),dy=Math.sin(angle);this.glow.setPosition(x+dx*d*.4,y+dy*d*.4).setScale(d/45,1.9).setRotation(angle).setAlpha(.38+Math.sin(t*37)*.07);
   // Layered, turbulent ribbons form a connected flame from mouth to tip.
   for(let layer=0;layer<5;layer++){
    const length=d*(1-layer*.12),width=1-layer*.16,pts:{x:number;y:number}[]=[];
    for(const side of [1,-1])for(let i=0;i<=18;i++){
     const k=side===1?i:18-i,u=k/18,along=u*length;
     const taper=Math.sin(Math.PI*u)*(.15+u*.85),w=(7+u*48)*width*(.35+taper);
     const wobble=(Math.sin(u*17-t*24+layer*2)+Math.sin(u*31-t*33))*(2+u*7);
     const cross=side*w*(1-u*.65)+wobble*width;
     pts.push({x:x+dx*along-dy*cross,y:y+dy*along+dx*cross});
    }
    const color=[0xc44017,0xf36a1d,0xffad31,0xffda73,0xfff6cc][layer];this.graphics.fillStyle(color,[.38,.6,.72,.82,.92][layer]);this.graphics.fillPoints(pts,true);
   }
   this.accumulator+=dt*150;
   while(this.accumulator>=1){this.accumulator--;if(this.particles.length>=180)break;const a=angle+(Math.random()-.5)*.4,speed=250+Math.random()*190,life=Math.max(.05,this.range/speed*(.65+Math.random()*.35));const image=this.scene.add.image(x,y,'flame').setBlendMode(Phaser.BlendModes.ADD).setDepth(9001);this.particles.push({s:image,x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,life,max:life,size:.25+Math.random()*.35})}
  }else this.accumulator=0;
  for(let i=this.particles.length-1;i>=0;i--){const p=this.particles[i];p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(world.blocked(p.x,p.y,2))p.life=0;const age=1-p.life/p.max;p.s.setPosition(p.x,p.y).setScale(p.size*(.6+age*1.8),p.size*(.6+age)).setRotation(Math.atan2(p.vy,p.vx)).setAlpha(Math.max(0,(1-age)*.8));if(p.life<=0){p.s.destroy();this.particles.splice(i,1)}}
 }
 contains(x:number,y:number,r:number,world:World){if(!this.active)return false;const dx=x-this.x,dy=y-this.y,along=dx*Math.cos(this.angle)+dy*Math.sin(this.angle),cross=Math.abs(-dx*Math.sin(this.angle)+dy*Math.cos(this.angle));return along>=-r&&along<=this.range+r&&cross<10+Math.max(0,along)*.21+r&&world.lineClear(this.x,this.y,x,y)}
 clear(){this.active=false;this.graphics.clear();this.glow.setVisible(false);for(const p of this.particles)p.s.destroy();this.particles=[]}
}
