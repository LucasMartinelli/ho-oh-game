async(page)=>{const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:5174/');await page.waitForFunction(()=>window.battle?.player);await page.locator('#play').click();if(await page.locator('#new-confirm').isVisible())await page.locator('#confirm-new').click();
await page.evaluate(()=>{const n=document.getElementById('notice');if(n)n.style.display='none';const q=document.getElementById('objective');if(q)q.style.display='none'});
const dirs=[['left',-1,0],['right',1,0],['up',0,-1],['down',0,1]];
const out={};
for(const [name,dx,dy] of dirs){const info=await page.evaluate(([dx,dy])=>{const s=window.battle;s.player.x=1100;s.player.y=5000;s.player.heat=0;s.player.overheated=false;s.player.invulnerable=999;s.player.dx=dx;s.player.dy=dy;s.flightCamera.snap(1100,5000);for(const e of s.enemies)e.destroy();s.enemies=[];const cam=s.cameras.main;return{zoom:cam.zoom,scrollX:cam.scrollX,scrollY:cam.scrollY,midX:cam.midPoint.x,midY:cam.midPoint.y}},[dx,dy]);out[name]=info;await page.keyboard.down('Space');await page.waitForTimeout(400);
 const pos=await page.evaluate(()=>{const s=window.battle,cam=s.cameras.main;return{px:(s.player.sprite.x-cam.scrollX)*cam.zoom,py:(s.player.sprite.y-cam.scrollY)*cam.zoom,mx:(s.flame.x-cam.scrollX)*cam.zoom,my:(s.flame.y-cam.scrollY)*cam.zoom,flip:s.player.sprite.flipX}});
 await page.screenshot({path:`output/playwright/beak-${name}.png`,fullPage:true});out[name].pos=pos;await page.keyboard.up('Space');await page.waitForTimeout(80)}
if(errors.length)throw Error(errors.join('\n'));return out}
