async(page)=>{
 await page.context().setOffline(false);
 await page.addInitScript(()=>{window.audioDecodes=[];const original=AudioContext.prototype.decodeAudioData;AudioContext.prototype.decodeAudioData=function(...args){const result=original.apply(this,args);result.then(b=>window.audioDecodes.push({duration:b.duration,channels:b.numberOfChannels}));return result}});
 await page.goto('http://127.0.0.1:5173/jogar.html?v=5');await page.evaluate(()=>localStorage.removeItem('hooh-adventure-v2'));await page.reload();await page.context().setOffline(true);

 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.waitForFunction(()=>document.querySelector('#hero')?.style.backgroundImage.includes('data:image/png'));
 await page.locator('#play').click();if(await page.locator('#new-confirm').isVisible())await page.locator('#confirm-new').click();await page.keyboard.press('k');await page.locator('#skills').waitFor({state:'visible'});await page.locator('[data-skill=embers]').click();await page.locator('#skills .panel-close').click();await page.keyboard.down('Space');await page.waitForTimeout(350);await page.keyboard.up('Space');await page.keyboard.press('m');await page.locator('#map').waitFor({state:'visible'});await page.locator('#map .panel-close').click();await page.locator('#pause').click();await page.locator('#paused').waitFor({state:'visible'});await page.locator('#menu-back').click();
 if(await page.evaluate(()=>typeof window.battle!=='undefined'))throw new Error('Ferramentas de desenvolvimento na versão final');if(errors.length)throw new Error(errors.join('\n'));
 await page.waitForFunction(()=>window.audioDecodes.length===2);const music=await page.evaluate(()=>window.audioDecodes);await page.context().setOffline(false);return {music,standalone:'sprites, início, árvore, compra, lança-chamas, mapa, pausa e retorno à tela inicial',developmentHooks:'ausentes',errors};
}
