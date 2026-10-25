async(page)=>{
 await page.evaluate(()=>battle.pause());
 const result=await page.evaluate(()=>{
  const s=battle;for(const e of s.enemies)e.destroy();s.enemies=[];s.combat.clear();s.state='paused';s.player.x=1800;s.player.y=4200;s.player.hp=100;s.player.invulnerable=0;
  const e=s.spawn('bulbasaur',1800,4100,1,'qa-roots');e.aggro=true;e.attack.time=0;s.encounters.update(e,.01);const initial=s.player.hp;
  s.state='playing';s.encounters.update(e,.5);const warningDamage=initial-s.player.hp;s.encounters.update(e,2);const hit=initial-s.player.hp;
  s.player.hp=100;s.player.invulnerable=0;e.attack.phase='idle';e.attack.time=0;s.encounters.update(e,.01);s.player.x+=150;s.encounters.update(e,2);const escaped=s.player.hp===100;
  s.state='paused';e.destroy();s.enemies=[];
  const boss=s.spawn('charizard',1800,4200,1,'qa-boss');s.player.x=boss.x+110;s.player.y=boss.y;boss.attack.time=0;s.encounters.update(boss,.01);const first=boss.attack.duration;boss.hp=boss.maxHp*.4;boss.attack.phase='idle';boss.attack.time=0;s.encounters.update(boss,.01);const second=boss.attack.duration;
  return {warningDamage,hit,escaped,first,second};
 });if(result.warningDamage!==0||result.hit<=0||!result.escaped||result.second>=result.first)throw Error(JSON.stringify(result));
 await page.evaluate(()=>{const s=battle,e=s.enemies[0];s.player.x=e.x;s.player.y=e.y+140;s.flightCamera.snap(s.player.x,s.player.y);e.attack.phase='idle';e.attack.time=0;e.attack.turn=0;e.aggro=true;s.state='playing';s.onChange()});await page.waitForTimeout(250);await page.screenshot({path:'output/playwright/gameplay-boss-warning.png'});await page.locator('#pause').click();
 await page.setViewportSize({width:844,height:390});await page.locator('#resume').click();await page.waitForTimeout(100);await page.screenshot({path:'output/playwright/gameplay-landscape.png'});return result;
}
