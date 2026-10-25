export type Difficulty='easy'|'hard';
export const DIFFICULTY={
 easy:{label:'Fácil',hp:.65,damage:.5,speed:.72,xp:1.8,alert:165,leash:330,shots:1.8,projectile:.7,duoHp:1.2,duoDamage:1.08,duoSpeed:1.03,duoShots:.95},
 hard:{label:'Difícil',hp:1,damage:1,speed:1,xp:1,alert:335,leash:580,shots:1,projectile:1,duoHp:1.45,duoDamage:1.18,duoSpeed:1.08,duoShots:.85}
} as const;
