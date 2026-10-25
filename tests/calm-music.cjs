async(page)=>{
 const results=[],errors=[];page.on('pageerror',e=>errors.push(e.message));const assert=(ok,label)=>{if(!ok)throw new Error(label);results.push(label)};
 await page.setViewportSize({width:390,height:844});await page.goto('http://127.0.0.1:5174/');await page.waitForFunction(()=>window.battle?.player);await page.evaluate(()=>localStorage.removeItem('hooh-adventure-v2'));await page.reload();await page.locator('#play').click();if(await page.locator('#new-confirm').isVisible())await page.locator('#confirm-new').click();await page.waitForFunction(()=>window.battle.audio.musicReady,{timeout:15000});
 // O jogador nasce no santuário (CAMPS[0]): modo calmo de refúgio deve estar ativo.
 await page.waitForTimeout(1500);
 assert(await page.evaluate(()=>{const a=window.battle.audio;return a.musicFilter.frequency.value<6000&&a.intensity.gain.value<.15}),'Refúgio: filtro suave e sem camada de combate');
 // Inimigo agressivo dentro do refúgio não deve ativar a camada de combate.
 await page.evaluate(()=>{const s=window.battle;s.player.x=700;s.player.y=5500;const e=s.spawn('rattata',760,5560,1,'calm-rat',0);e.aggro=true;window.__rat=e});
 await page.waitForTimeout(1500);
 assert(await page.evaluate(()=>window.battle.audio.intensity.gain.value<.2),'Refúgio: combate não sobe a intensidade');
 await page.evaluate(()=>{const s=window.battle,e=window.__rat;e.destroy();s.enemies.splice(s.enemies.indexOf(e),1)});
 // Longe do refúgio a trilha volta ao brilho normal.
 await page.evaluate(()=>{const s=window.battle;s.player.x=2400;s.player.y=1800;s.flightCamera.snap(2400,1800)});
 await page.waitForTimeout(2500);
 assert(await page.evaluate(()=>{const a=window.battle.audio;return a.musicFilter.frequency.value>15000}),'Exploração: filtro aberto fora do refúgio');
 // Pausa: música calma (reduzida e filtrada), não silêncio.
 await page.evaluate(()=>window.battle.pause());await page.waitForTimeout(1600);
 assert(await page.evaluate(()=>{const a=window.battle.audio;return a.musicBus.gain.value>.15&&a.musicBus.gain.value<.5&&a.musicFilter.frequency.value<2500&&a.intensity.gain.value<.3}),'Pausa: trilha calma audível');
 // Retomar: ganho e filtro restaurados.
 await page.evaluate(()=>window.battle.pause());await page.waitForTimeout(1600);
 assert(await page.evaluate(()=>{const a=window.battle.audio;return a.musicBus.gain.value>.6&&a.musicFilter.frequency.value>15000}),'Retomar: trilha restaurada');
 assert(errors.length===0,'Sem exceções JavaScript');return{results,errors};
}
