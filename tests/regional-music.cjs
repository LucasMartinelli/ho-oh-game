async(page)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width:390,height:844});await page.reload();await page.waitForFunction(()=>window.battle?.player);await page.locator('#play').click();await page.locator('#confirm-new').click();await page.waitForFunction(()=>battle.audio.musicReady);await page.locator('#pause').click();
 const tracks=[];
 for(let region=0;region<4;region++){
  await page.evaluate(r=>{battle.audio.pause(false);battle.audio.setEnvironment(r,false,false)},region);await page.waitForFunction(r=>battle.audio.loadedRegion===r,region);await page.waitForTimeout(1800);
  const track=await page.evaluate(()=>{const a=battle.audio;return {title:a.trackTitle,sources:a.musicSources.length,outgoing:a.outgoing.length,error:a.musicError,loop:a.musicSources.every(s=>s.loop),duration:a.musicSources[0].buffer.duration,signal:Math.max(...a.musicSources[0].buffer.getChannelData(0).slice(10000,40000).map(Math.abs))}});
  if(track.error||track.sources!==2||track.outgoing>2||!track.loop||track.signal<.01)throw Error(JSON.stringify(track));tracks.push(track);
 }
 await page.evaluate(()=>battle.audio.setEnvironment(3,true,true));await page.waitForTimeout(1200);if(!await page.evaluate(()=>battle.audio.intensity.gain.value>.5))throw Error('Boss intensity');
 await page.evaluate(()=>{for(const r of [1,2,0,3,1])battle.audio.setEnvironment(r,false,false)});await page.waitForFunction(()=>battle.audio.loadedRegion===1);await page.evaluate(()=>battle.audio.pause(true));await page.waitForTimeout(1200);const calm=await page.evaluate(()=>{const a=battle.audio;return{gain:a.musicBus.gain.value,filter:a.musicFilter.frequency.value,intensity:a.intensity.gain.value}});if(!(calm.gain>.15&&calm.gain<.5&&calm.filter<2500&&calm.intensity<.3))throw Error('Pause calm '+JSON.stringify(calm));
 await page.evaluate(()=>{Object.defineProperty(navigator,'userAgent',{configurable:true,value:'Mozilla/5.0 (iPhone) CriOS'});Object.defineProperty(document.documentElement,'requestFullscreen',{configurable:true,value:undefined})});await page.locator('#pause-fullscreen').click();if(!await page.locator('#fullscreen-status').isVisible()||!await page.locator('#fullscreen-status').textContent().then(s=>s.includes('Tela de Início')))throw Error('iPhone help');await page.screenshot({path:'output/playwright/iphone-fullscreen-help.png'});
 const manifest=await page.evaluate(async()=>{const m=await (await fetch('manifest.webmanifest')).json();return {mode:m.display,icons:await Promise.all(m.icons.map(async i=>(await fetch(i.src)).status))}});if(manifest.mode!=='standalone'||manifest.icons.some(s=>s!==200))throw Error('Manifest');
 if(errors.length)throw Error(errors.join(','));return {tracks,manifest,errors};
}
