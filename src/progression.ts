export type SkillId='embers'|'reach'|'burn'|'inferno'|'wind'|'dash'|'cyclone'|'talons'|'vitality'|'warmth'|'aegis'|'rebirth';
export interface Skill {id:SkillId;name:string;branch:number;tier:number;max:number;level:number;requires?:SkillId;requiredRank?:number;icon:string;description:string}
export const SKILLS:Skill[]=[
 {id:'embers',name:'Brasa viva',branch:0,tier:0,max:3,level:1,icon:'♨',description:'+20% de dano do lança-chamas por ponto.'},
 {id:'reach',name:'Língua de fogo',branch:0,tier:1,max:3,level:2,requires:'embers',icon:'➶',description:'+35 de alcance do lança-chamas por ponto.'},
 {id:'burn',name:'Combustão',branch:0,tier:2,max:3,level:3,requires:'reach',icon:'♜',description:'Incendeia o alvo: 8 de dano/s por ponto durante 2 segundos.'},
 {id:'inferno',name:'Inferno sagrado',branch:0,tier:3,max:1,level:5,requires:'burn',requiredRank:2,icon:'☀',description:'[Q] Explosão de fogo: 160 de dano em área. Recarga: 9 s.'},
 {id:'wind',name:'Vento favorável',branch:1,tier:0,max:3,level:1,icon:'≋',description:'+8% de velocidade de voo por ponto.'},
 {id:'dash',name:'Asas velozes',branch:1,tier:1,max:2,level:2,requires:'wind',icon:'ϟ',description:'Reduz a recarga do impulso em 0,5 s por ponto.'},
 {id:'cyclone',name:'Ciclone',branch:1,tier:2,max:1,level:3,requires:'dash',icon:'◎',description:'[R] Rajada de vento: empurra e desacelera inimigos por 3 s. Recarga: 8 s.'},
 {id:'talons',name:'Mergulho cortante',branch:1,tier:3,max:2,level:5,requires:'cyclone',icon:'⋙',description:'O impulso atravessa inimigos causando 70 de dano por ponto.'},
 {id:'vitality',name:'Coração da fênix',branch:2,tier:0,max:3,level:1,icon:'♥',description:'+20 de vida máxima por ponto. Recupera a vida adicional.'},
 {id:'warmth',name:'Calor vital',branch:2,tier:1,max:3,level:2,requires:'vitality',icon:'✚',description:'Recupera 3 de vida por ponto ao derrotar um inimigo.'},
 {id:'aegis',name:'Plumagem solar',branch:2,tier:2,max:2,level:3,requires:'warmth',icon:'◇',description:'Reduz todo dano recebido em 12% por ponto.'},
 {id:'rebirth',name:'Renascer',branch:2,tier:3,max:1,level:5,requires:'aegis',icon:'✦',description:'Evita uma derrota e recupera 60% da vida. Recarrega ao descansar no santuário.'}
];
export class Progression {
 level=1;xp=0;points=1;ranks:Partial<Record<SkillId,number>>={};bonusHp=0;
 rank(id:SkillId){return this.ranks[id]??0}
 get needed(){return 40+this.level*22+this.level**2*5}
 get maxHp(){return 100+this.rank('vitality')*20+(this.level-1)*4+this.bonusHp}
 get range(){return 185+this.rank('reach')*35}
 get dps(){return (58+(this.level-1)*3)*(1+this.rank('embers')*.2)}
 gain(xp:number){this.xp+=xp;let gained=0;while(this.level<15&&this.xp>=this.needed){this.xp-=this.needed;this.level++;this.points++;gained++}if(this.level===15)this.xp=Math.min(this.xp,this.needed);return gained}
 reason(id:SkillId){const s=SKILLS.find(s=>s.id===id)!;if(this.rank(id)>=s.max)return 'Habilidade no máximo';if(this.level<s.level)return `Requer nível ${s.level}`;if(s.requires&&this.rank(s.requires)<(s.requiredRank??1))return `Requer ${SKILLS.find(k=>k.id===s.requires)!.name} ${s.requiredRank??1}`;if(this.points<=0)return 'Ganhe um nível para obter mais pontos';return ''}
 learn(id:SkillId){if(this.reason(id))return false;this.ranks[id]=this.rank(id)+1;this.points--;return true}
 load(raw:{level:number;xp:number;points:number;ranks:Partial<Record<SkillId,number>>;bonusHp?:number}){this.level=Math.max(1,Math.min(15,Math.floor(raw.level)||1));this.xp=Math.max(0,Number(raw.xp)||0);this.points=Math.max(0,Math.min(40,Math.floor(raw.points)||0));this.bonusHp=Math.max(0,Math.min(120,Math.floor(raw.bonusHp||0)));for(const s of SKILLS)this.ranks[s.id]=Math.max(0,Math.min(s.max,Math.floor(raw.ranks?.[s.id]??0)))}
}
