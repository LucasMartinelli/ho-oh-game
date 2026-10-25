import {HOME} from './adventure';
import Phaser from 'phaser';
import {Species,SPRITES} from './assets';
export const STATS:Record<string,{hp:number;speed:number;damage:number;points:number;xp:number;label:string}>={
 caterpie:{hp:42,speed:42,damage:7,points:100,xp:30,label:'Caterpie'},rattata:{hp:65,speed:87,damage:10,points:160,xp:40,label:'Rattata'},pidgey:{hp:55,speed:70,damage:9,points:140,xp:38,label:'Pidgey'},zubat:{hp:60,speed:99,damage:9,points:180,xp:45,label:'Zubat'},bulbasaur:{hp:110,speed:44,damage:12,points:260,xp:65,label:'Bulbasaur'},squirtle:{hp:100,speed:50,damage:18,points:300,xp:70,label:'Squirtle'},charizard:{hp:1050,speed:69,damage:17,points:2500,xp:280,label:'Charizard'},blastoise:{hp:850,speed:42,damage:23,points:2500,xp:240,label:'Blastoise'},venusaur:{hp:650,speed:38,damage:13,points:2000,xp:210,label:'Venusaur'},dragonite:{hp:1500,speed:80,damage:20,points:4000,xp:400,label:'Dragonite'}
};
export class Actor{
 sprite:Phaser.GameObjects.Image;shadow:Phaser.GameObjects.Ellipse;x:number;y:number;r=15;hp=100;maxHp=100;flash=0;phase=Math.random()*6.28;
 constructor(scene:Phaser.Scene,x:number,y:number,public species:Species,public scale=1){this.x=x;this.y=y;this.shadow=scene.add.ellipse(x,y+21,40*scale,14*scale,0x193d2e,.26);this.sprite=scene.add.image(x,y,species,0).setScale(scale)}
 render(t:number,dt=.016,key:string=this.species){const anim=SPRITES[key as keyof typeof SPRITES];this.sprite.setTexture(key,Math.floor(t*anim.fps+this.phase)%anim.frames).setPosition(this.x,this.y+Math.sin(t*4+this.phase)*2).setDepth(this.y+50);this.shadow.setPosition(this.x,this.y+23).setDepth(this.y-1);this.flash=Math.max(0,this.flash-dt);if(this.flash>0)this.sprite.setTintFill(0xffe7b1);else this.sprite.clearTint()}
 destroy(){this.sprite.destroy();this.shadow.destroy()}
}
export class Player extends Actor{
 dx=0;dy=-1;invulnerable=0;fireCooldown=0;dashCooldown=0;dashTime=0;fired=0;heat=0;overheated=false;infernoCooldown=0;cycloneCooldown=0;
 constructor(scene:Phaser.Scene){super(scene,HOME.x,HOME.y,'hooh',1.12);this.r=19}
}
export class Enemy extends Actor{
 speed:number;damage:number;points:number;xp:number;boss:boolean;shot=1+Math.random();hitTime=0;kx=0;ky=0;charge=0;chargeX=0;chargeY=0;special=4;steer=1;
 duoScaled=false;homeX:number;homeY:number;aggro=false;burn=0;slow=0;dashHit=0;id='';region=0;
 constructor(scene:Phaser.Scene,x:number,y:number,species:Species,level:number){const boss=['charizard','blastoise','venusaur','dragonite'].includes(species);super(scene,x,y,species,boss?1.5:1.12);const s=STATS[species];this.boss=boss;this.r=boss?36:16;this.maxHp=this.hp=Math.round(s.hp*(boss?1:1+Math.max(0,level-1)*.09));this.speed=s.speed;this.damage=s.damage;this.points=s.points;this.xp=s.xp;this.steer=Math.random()<.5?-1:1;this.homeX=x;this.homeY=y}
}
