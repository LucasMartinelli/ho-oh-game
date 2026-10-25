import Phaser from 'phaser';
export const TREE_PALETTES=[['#193d2a','#2b5032','#3c633a','#557d43','#789653','#b3bc78'],['#193e38','#285b4c','#39705c','#558c73','#7fac92','#c2d3ad'],['#443b2d','#5d5134','#79663d','#94834f','#b7a565','#ddd099'],['#2d3d42','#425457','#526d6d','#6f8980','#91a69a','#c3cfb6']];
export function seeded(seed:number){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}}
export function makeScenery(scene:Phaser.Scene){
 const feather=scene.textures.createCanvas('gold-feather',20,32)!,f=feather.context;f.fillStyle='#ba8b43';f.beginPath();f.moveTo(4,29);f.lineTo(7,9);f.lineTo(16,2);f.lineTo(15,18);f.fill();f.fillStyle='#f6d782';f.beginPath();f.moveTo(5,26);f.lineTo(8,10);f.lineTo(15,3);f.lineTo(12,18);f.fill();f.strokeStyle='#fff2b6';f.beginPath();f.moveTo(4,30);f.lineTo(13,6);f.stroke();feather.refresh();
}
