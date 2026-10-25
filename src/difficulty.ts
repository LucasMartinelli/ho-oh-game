export type Difficulty='easy'|'hard';
export const DIFFICULTY={
 easy:{label:'Fácil',hp:.65,damage:.5,speed:.72,xp:1.8,alert:165,leash:330,projectile:.7,duoHp:1.15,duoDamage:1.05,duoSpeed:1.02},
 hard:{label:'Difícil',hp:1,damage:1,speed:1,xp:1,alert:335,leash:580,projectile:1,duoHp:1.28,duoDamage:1.12,duoSpeed:1.06}
} as const;
