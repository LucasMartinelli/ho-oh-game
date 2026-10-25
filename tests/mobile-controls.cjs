async(page)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:390,height:844});await page.reload();await page.waitForFunction(()=>window.battle?.player);
 await page.locator('#play').click();await page.locator('#confirm-new').click();
 await page.waitForTimeout(350);
 const checks=[];const check=(v,m)=>{if(!v)throw Error(m);checks.push(m)};
 const cdp=await page.context().newCDPSession(page);await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
 const stick=await page.locator('#touch-stick').boundingBox(),fire=await page.locator('#touch-fire').boundingBox();
 const a={x:stick.x+stick.width/2,y:stick.y+stick.height/2,id:1},b={x:fire.x+fire.width/2,y:fire.y+fire.height/2,id:2};
 const start=await page.evaluate(()=>({x:battle.player.x,y:battle.player.y}));
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[a,b]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...a,x:a.x+28,y:a.y-28},b]});await page.waitForTimeout(350);
 const during=await page.evaluate(()=>({x:battle.player.x,y:battle.player.y,heat:battle.player.heat,...battle.touch}));
 check(during.fire&&during.heat>0,'Fogo contínuo com segundo dedo');check(during.x>0&&during.y<0,'Direcional diagonal com primeiro dedo');
 check(await page.evaluate(s=>battle.player.x>s.x&&battle.player.y<s.y,start),'Movimento e fogo simultâneos');
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[{...a,x:a.x+28,y:a.y-28}]});await page.waitForTimeout(70);
 check(await page.evaluate(()=>battle.touch.x===0&&battle.touch.y===0&&battle.touch.fire),'Soltar direcional mantém fogo independente');
 await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});await page.waitForTimeout(70);check(await page.evaluate(()=>!battle.touch.fire),'Cancelamento libera fogo');
 await page.locator('#touch-dash').dispatchEvent('pointerdown',{pointerId:3,pointerType:'touch'});await page.waitForTimeout(80);check(await page.evaluate(()=>battle.player.dashCooldown>0),'Impulso por toque');
 await page.locator('#skills-button').click();check(await page.locator('#skills').isVisible(),'Árvore acessível');await page.locator('#skills .panel-close').click();
 await page.locator('#map-button').click();check(await page.locator('#map').isVisible(),'Mapa acessível');await page.locator('#map .panel-close').click();
 await page.locator('#pause').click();check(await page.locator('#paused').isVisible(),'Menu de pausa acessível');await page.locator('#resume').click();
 for(const [w,h] of [[390,844],[360,640],[844,390],[667,375]]){
  await page.setViewportSize({width:w,height:h});await page.waitForTimeout(180);
  for(const id of ['touch-stick','touch-fire','touch-dash','skills-button','map-button','pause','ability-q','ability-r','fullscreen']){
   const r=await page.locator('#'+id).boundingBox();check(r&&r.x>=0&&r.y>=0&&r.x+r.width<=w+1&&r.y+r.height<=h+1,`${w}x${h}: ${id} visível`);
  }
  check(await page.evaluate(()=>document.documentElement.scrollHeight===innerHeight&&document.documentElement.scrollWidth===innerWidth),`${w}x${h}: sem scroll`);
  await page.screenshot({path:`output/playwright/mobile-${w}.png`});
 }
 const desktop=await page.context().browser().newContext({viewport:{width:1440,height:900},hasTouch:false});const dp=await desktop.newPage();await dp.goto('http://127.0.0.1:5174');await dp.waitForFunction(()=>window.battle?.player);await dp.locator('#play').click();await dp.locator('#confirm-new').click();check(!await dp.locator('#touch-controls').isVisible(),'Desktop preservado');await desktop.close();
 check(errors.length===0,'Sem erros JavaScript');return {checks:checks.length,errors};
}
