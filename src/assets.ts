import Phaser from 'phaser';
import sprites from './sprite-data.json';
export type Species = 'hooh'|'lugia'|'caterpie'|'rattata'|'pidgey'|'zubat'|'bulbasaur'|'squirtle'|'charizard'|'blastoise'|'venusaur'|'dragonite';
export const SPRITES=sprites;
export function preloadSprites(scene:Phaser.Scene){for(const [key,s] of Object.entries(sprites))scene.load.spritesheet(key,s.data,{frameWidth:s.size,frameHeight:s.size})}
export function buildAssets(scene:Phaser.Scene){
 const t=scene.textures.createCanvas('fire',24,16)!;const c=t.context;c.fillStyle='#e15d35';c.fillRect(3,4,16,8);c.fillStyle='#ffc65b';c.fillRect(8,3,11,10);c.fillStyle='#fff2b1';c.fillRect(13,5,7,6);t.refresh();
 const p=scene.textures.createCanvas('spark',4,4)!;p.context.fillStyle='#fff';p.context.fillRect(0,0,4,4);p.refresh();
 for(const [name,col,hi] of [['water','#4f9edc','#b7f4f4'],['leaf','#8cbb4d','#e0ef9b']]){const t=scene.textures.createCanvas(name,14,14)!;t.context.fillStyle=col;t.context.fillRect(2,2,10,10);t.context.fillStyle=hi;t.context.fillRect(3,3,5,4);t.refresh()}
 const h=scene.textures.createCanvas('heart',16,16)!;h.context.fillStyle='#ff9889';h.context.fillRect(2,4,5,6);h.context.fillRect(9,4,5,6);h.context.fillRect(4,7,8,6);h.context.fillRect(6,12,4,2);h.refresh();
 const glow=scene.textures.createCanvas('glow',64,64)!;const g=glow.context.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'#fff4c9');g.addColorStop(.2,'#ffd891cc');g.addColorStop(.55,'#e978303f');g.addColorStop(1,'#ff531000');glow.context.fillStyle=g;glow.context.fillRect(0,0,64,64);glow.refresh();
 const flame=scene.textures.createCanvas('flame',48,48)!;const fc=flame.context;const fg=fc.createRadialGradient(22,25,1,23,25,23);fg.addColorStop(0,'#fffce3');fg.addColorStop(.18,'#ffe9a5');fg.addColorStop(.4,'#ffbc45ed');fg.addColorStop(.68,'#fa6322b0');fg.addColorStop(1,'#c2260800');fc.fillStyle=fg;fc.fillRect(0,0,48,48);flame.refresh();
}
