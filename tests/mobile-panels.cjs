async(page)=>{
 await page.setViewportSize({width:360,height:640});await page.goto('http://127.0.0.1:5174');await page.waitForFunction(()=>window.battle?.player);await page.locator('#continue').click();
 await page.evaluate(()=>{battle.progress.ranks.inferno=1;battle.progress.ranks.cyclone=1;battle.onChange()});
 await page.locator('#ability-q').click();await page.waitForTimeout(100);if(!await page.evaluate(()=>battle.player.infernoCooldown>0))throw Error('Inferno');
 await page.locator('#ability-r').click();await page.waitForTimeout(100);if(!await page.evaluate(()=>battle.player.cycloneCooldown>0))throw Error('Ciclone');
 const cdp=await page.context().newCDPSession(page);await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});const f=await page.locator('#touch-fire').boundingBox();await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:f.x+40,y:f.y+40}]});await page.waitForTimeout(80);
 await page.evaluate(()=>battle.pause());if(!await page.evaluate(()=>!battle.touch.fire&&!battle.touch.x&&!battle.touch.y))throw Error('Pause input');await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
 await page.locator('#menu-back').click();await page.waitForTimeout(600);await page.screenshot({path:'output/playwright/mobile-menu.png'});await page.locator('#continue').click();await page.locator('#skills-button').click();await page.screenshot({path:'output/playwright/mobile-skills.png'});
 await page.goto('http://127.0.0.1:5173/jogar.html?v=11');await page.locator('#play').click();await page.locator('#confirm-new').click();await page.waitForTimeout(500);if(!await page.locator('#touch-stick').isVisible())throw Error('Standalone');return 'Golpes, pausa com dedo pressionado, menus e versão autocontida passaram';
}
