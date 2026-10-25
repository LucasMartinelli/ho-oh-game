import type {Species} from './assets';
export const HOME={x:700,y:5500};
export const REGIONS=[
 {name:'Bosque Esmeralda',subtitle:'Entre raízes antigas',x:1800,y:4200,color:0xa7ce84,level:2,guardian:'venusaur' as Species,seal:'Raiz',pool:['caterpie','rattata','bulbasaur'] as Species[]},
 {name:'Lago das Marés',subtitle:'Onde a água guarda segredos',x:4500,y:4400,color:0x86d3df,level:5,guardian:'blastoise' as Species,seal:'Maré',pool:['squirtle','pidgey','rattata'] as Species[]},
 {name:'Vale das Cinzas',subtitle:'Sob o sopro do vulcão',x:6000,y:2700,color:0xf0ad73,level:8,guardian:'charizard' as Species,seal:'Brasa',pool:['zubat','rattata','pidgey'] as Species[]},
 {name:'Ruínas do Céu',subtitle:'O último guardião',x:7000,y:800,color:0xd0b9e4,level:11,guardian:'dragonite' as Species,seal:'Céu',pool:['zubat','bulbasaur','squirtle'] as Species[]}
];
// Authored journey: clearings, narrow crossings, rest areas and side routes.
export const STAGES=[
 {x:700,y:5500,rx:480,ry:420,region:0,name:'Santuário da Aurora'},
 {x:1100,y:5000,rx:480,ry:380,region:0,name:'Trilha das Lanternas'},
 {x:900,y:4400,rx:520,ry:430,region:0,name:'Jardim das Raízes'},
 {x:1800,y:4200,rx:560,ry:500,region:0,name:'Coração do Bosque'},
 {x:2300,y:4800,rx:460,ry:390,region:1,name:'Porto dos Juncos'},
 {x:3100,y:4900,rx:430,ry:350,region:1,name:'Travessia das Marés'},
 {x:3700,y:4100,rx:500,ry:420,region:1,name:'Jardim das Cascatas'},
 {x:4500,y:4400,rx:570,ry:460,region:1,name:'Templo das Águas'},
 {x:5300,y:3900,rx:450,ry:400,region:2,name:'Passo da Obsidiana'},
 {x:5700,y:3300,rx:430,ry:390,region:2,name:'Garganta dos Ventos'},
 {x:6000,y:2700,rx:560,ry:500,region:2,name:'Caldeira Adormecida'},
 {x:5200,y:2000,rx:470,ry:400,region:3,name:'Escadaria dos Antigos'},
 {x:5900,y:1400,rx:480,ry:390,region:3,name:'Observatório Esquecido'},
 {x:7000,y:800,rx:610,ry:500,region:3,name:'Coroa do Céu'},
 {x:1700,y:5400,rx:270,ry:250,region:0,name:'Clareira das Plumas'},
 {x:3900,y:5100,rx:320,ry:270,region:1,name:'Ilha do Eco'},
 {x:6600,y:3700,rx:350,ry:300,region:2,name:'Ninho de Cinzas'},
 {x:6800,y:1800,rx:350,ry:270,region:3,name:'Arquivo Celeste'}
];
export const coastline=(x:number,y:number,a:number)=>1+.055*Math.sin(a*3+x*.003)+.035*Math.cos(a*7+y*.002)+.02*Math.sin(a*11);
export const ROUTE=STAGES.slice(0,14);
export const CONNECTIONS=[...ROUTE.slice(1).map((_,i)=>[i,i+1]),[1,14],[5,15],[9,16],[12,17]];
export const CAMPS=[{...HOME,name:'Aurora'}, {x:1850,y:4450,name:'Refúgio do Bosque'}, {x:4450,y:4670,name:'Refúgio das Marés'}, {x:6150,y:2950,name:'Refúgio das Cinzas'}, {x:6750,y:1040,name:'Refúgio do Céu'}];
export const BEACONS=[
 {x:1100,y:5000,region:0,name:'Lanterna da Aurora'}, {x:900,y:4400,region:0,name:'Raiz Primordial'},
 {x:2300,y:4800,region:1,name:'Farol dos Juncos'}, {x:3700,y:4100,region:1,name:'Fonte das Marés'},
 {x:5300,y:3900,region:2,name:'Braseiro de Obsidiana'}, {x:5700,y:3300,region:2,name:'Chama dos Ventos'},
 {x:5200,y:2000,region:3,name:'Memória dos Antigos'}, {x:5900,y:1400,region:3,name:'Estrela do Observatório'}
];
export const FEATHERS=[{x:1600,y:4000},{x:1050,y:4170},{x:4700,y:4200},{x:3500,y:3900},{x:6250,y:2500},{x:5800,y:2900},{x:7200,y:650},{x:6750,y:650},...STAGES.slice(1).filter((_,i)=>![2,6,9,12].includes(i)).map(p=>({x:p.x+120,y:p.y+100}))];
// Optional ability-sealed caches: breaking the seal needs a learned move.
export const GATES=[
 {id:'gate-0',stage:14,dx:90,dy:-70,kind:'bramble' as const,needs:'inferno' as const,xp:150,name:'Espinheiro Sagrado'},
 {id:'gate-1',stage:16,dx:-90,dy:60,kind:'rock' as const,needs:'cyclone' as const,xp:200,name:'Rocha Selada'},
 {id:'gate-2',stage:17,dx:80,dy:80,kind:'crystal' as const,needs:'talons' as const,xp:250,name:'Cristal Antigo'}
];
// Telegraphed regional hazards on optional edges: spores / currents / vents / gusts.
export const HAZARDS=[
 {kind:'spore',stage:2,dx:150,dy:-80},{kind:'spore',stage:3,dx:-170,dy:70},
 {kind:'current',stage:5,dx:130,dy:-50},{kind:'current',stage:7,dx:-150,dy:50},
 {kind:'vent',stage:9,dx:140,dy:-80},{kind:'vent',stage:10,dx:-130,dy:90},
 {kind:'gust',stage:12,dx:150,dy:-70},{kind:'gust',stage:13,dx:-160,dy:-60}
];
export interface SaveData {version:2;worldRevision?:3;difficulty?:'easy'|'hard';lugia?:boolean;lugiaActive?:boolean;camps?:number[];beacons?:number[];checkpoint?:number;x:number;y:number;hp:number;level:number;xp:number;points:number;ranks:Record<string,number>;cleared:string[];discovered:number[];feathers:number[];guardians:number[];score:number;kills:number;elapsed:number;rebirthUsed:boolean;victorySeen:boolean;ash?:number;cycle?:number;tips?:string[];records?:Record<string,{time:number;hits:number;medal:number}>;bonusHp?:number;rainbow?:boolean}
const KEY='hooh-adventure-v2';
export function readSave():SaveData|null{try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(!s||s.version!==2||!Array.isArray(s.cleared)||!Array.isArray(s.guardians)||!Array.isArray(s.discovered)||!Array.isArray(s.feathers))return null;if(s.worldRevision!==3){s.x=HOME.x;s.y=HOME.y;s.camps=[0];s.beacons=BEACONS.flatMap((b,i)=>s.guardians.includes(b.region)?[i]:[]);s.checkpoint=0}return s}catch{return null}}
export function writeSave(s:SaveData){try{localStorage.setItem(KEY,JSON.stringify(s));return true}catch{return false}}
