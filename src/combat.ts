import Phaser from 'phaser';
export interface Projectile {sprite:Phaser.GameObjects.Image;x:number;y:number;vx:number;vy:number;life:number;damage:number;hostile:boolean;r:number;type:string;active:boolean}
export class Combat{
 bullets:Projectile[]=[];particles:{s:Phaser.GameObjects.Image;vx:number;vy:number;life:number;max:number}[]=[];
 constructor(private scene:Phaser.Scene){}
 shoot(x:number,y:number,angle:number,hostile=false,type='firebolt',damage=26,speed=510){
  let b=this.bullets.find(b=>!b.active);if(!b){if(this.bullets.length>220)return;const sprite=this.scene.add.image(x,y,type);b={sprite,x,y,vx:0,vy:0,life:0,damage,hostile,r:8,type,active:true};this.bullets.push(b)}
  Object.assign(b,{x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,life:hostile?3.4:.95,damage,hostile,type,r:hostile?8:10,active:true});b.sprite.setTexture(type).setPosition(x,y).setRotation(angle).setVisible(true).setAlpha(1).setScale(hostile?1.25:1.15).setDepth(y+80);
 }
 release(b:Projectile){b.active=false;b.sprite.setVisible(false)}
 burst(x:number,y:number,n=12,color=0xffc863){for(let i=0;i<n;i++){if(this.particles.length>380)break;const a=Math.random()*6.28,speed=35+Math.random()*140,life=.2+Math.random()*.4;const s=this.scene.add.image(x,y,'spark').setTint(i%3===0?0xfff1b6:color).setDepth(y+100).setScale(.7+Math.random());this.particles.push({s,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,life,max:life})}}
 update(dt:number){for(const b of this.bullets){if(!b.active)continue;b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;b.sprite.setPosition(b.x,b.y).setDepth(b.y+80);if(!b.hostile){b.sprite.setScale(1.1+Math.sin(b.life*40)*.15);if(Math.random()<dt*35)this.burst(b.x-b.vx*.025,b.y-b.vy*.025,1,0xef873e)}else{b.sprite.setScale(1.22+Math.sin(b.life*30)*.12);if(Math.random()<dt*14)this.burst(b.x-b.vx*.02,b.y-b.vy*.02,1,b.type==='water'?0x8bdde5:b.type==='leaf'?0xa8d87a:0xff9a50)}if(b.life<=0)this.release(b)}
  for(let i=this.particles.length-1;i>=0;i--){const p=this.particles[i];p.life-=dt;p.s.x+=p.vx*dt;p.s.y+=p.vy*dt;p.s.setAlpha(Math.max(0,p.life/p.max));if(p.life<=0){p.s.destroy();this.particles.splice(i,1)}}
 }
 clear(){for(const b of this.bullets)this.release(b);for(const p of this.particles)p.s.destroy();this.particles=[]}
}
