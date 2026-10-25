async(page)=>{
 const results=[],errors=[];page.on('pageerror',e=>errors.push(e.message));const assert=(ok,label)=>{if(!ok)throw new Error(label);results.push(label)};
 await page.goto(page.url().replace(/\/[^/]*$/, '/'));await page.waitForFunction(()=>window.battle?.player);
 await page.locator('#play').click();if(await page.locator('#new-confirm').isVisible())await page.locator('#confirm-new').click();
 await page.waitForTimeout(600);

 // Slide: an actor pushed diagonally into a collider rides the tangent around it.
 const slide=await page.evaluate(()=>{
  const s=window.battle,o=s.world.obstacles.find(o=>o.r===17);
  const a={x:o.x-50,y:o.y+10,r:19};
  for(let i=0;i<80;i++)s.world.move(a,2.5,-2.5);
  return{ox:o.x,oy:o.y,x:a.x,y:a.y};
 });
 assert(slide.x>slide.ox-40&&slide.y<slide.oy-20,'Ator desliza pela tangente da árvore em vez de travar');

 // Head-on into the collider stops cleanly instead of penetrating.
 assert(await page.evaluate(()=>{const s=window.battle,o=s.world.obstacles.find(o=>o.r===17);const a={x:o.x-60,y:o.y,r:19};for(let i=0;i<60;i++)s.world.move(a,2.5,0);return a.x<=o.x-o.r-19+1&&a.x>o.x-60&&!s.world.blocked(a.x,a.y,a.r)}),'Movimento frontal encosta no tronco sem atravessar');

 // An actor wedged inside an obstacle gets pushed out by move().
 assert(await page.evaluate(()=>{
  const s=window.battle,o=s.world.obstacles.find(o=>o.r===17),a={x:o.x+4,y:o.y,r:19};
  s.world.move(a,0,0);
  return !s.world.blocked(a.x,a.y,a.r);
 }),'Depenetração empurra ator para fora do obstáculo');

 // Enemy steers around a tree while chasing instead of jittering in place.
 await page.evaluate(()=>{
  const s=window.battle;for(const e of s.enemies)e.destroy();s.enemies=[];
  const camps=[[700,5500],[1850,4450],[4450,4670],[6150,2950],[6750,1040]];
  const o=s.world.obstacles.find(o=>o.r===17&&o.x>400&&o.x<7600&&o.y>400&&o.y<5700&&camps.every(c=>Math.hypot(o.x-c[0],o.y-c[1])>450)&&!s.world.blocked(o.x+140,o.y,19)&&!s.world.blocked(o.x-140,o.y,16));
  s.player.x=o.x+140;s.player.y=o.y;s.player.invulnerable=999;
  const e=s.spawn('rattata',o.x-140,o.y,1,'stuck-test');
  e.aggro=true;e.shot=999;e.special=999;
 });
 await page.waitForTimeout(5000);
 assert(await page.evaluate(()=>{
  const s=window.battle,e=s.enemies.find(e=>e.id==='stuck-test');
  return e&&Math.hypot(e.x-s.player.x,e.y-s.player.y)<190;
 }),'Inimigo contorna a árvore e alcança o jogador');

 // Enemy knocked into a pocket between obstacles cannot stay overlapped.
 assert(await page.evaluate(()=>{
  const s=window.battle,e=s.enemies.find(e=>e.id==='stuck-test')||s.spawn('caterpie',s.player.x+60,s.player.y,1,'knock-test');
  const o=s.world.obstacles.find(o=>o.r===17);e.x=o.x+o.r+2;e.y=o.y;
  s.world.move(e,-30,0);
  return !s.world.obstacles.some(ob=>Math.hypot(e.x-ob.x,e.y-ob.y)<e.r+ob.r-0.5);
 }),'Knockback não deixa inimigo cravado dentro do tronco');

 assert(errors.length===0,'Nenhuma exceção JavaScript');
 return{passed:results,errors};
}
