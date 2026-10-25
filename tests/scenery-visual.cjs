// Development visual/asset regression. Run in an isolated playwright-cli session:
// playwright-cli -s=scenery run-code --filename=tests/scenery-visual.cjs
async page => {
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const check=(ok,message)=>{if(!ok)throw Error(message)};
 await page.reload();await page.waitForFunction(()=>window.battle?.player);
 const assets=await page.evaluate(()=>{
  const s=battle,hash=v=>{let h=2166136261;for(const b of new TextEncoder().encode(JSON.stringify(v)))h=Math.imul(h^b,16777619)>>>0;return h};
  const size=k=>{const im=s.textures.get(k).getSourceImage();return [im.width,im.height]};
  return {obstacles:hash(s.world.obstacles),trees:hash(s.world.trees.map(t=>[t.x,t.y,t.phase])),
   tiles:s.textures.getTextureKeys().filter(k=>k.startsWith('terrain-')).map(size),
   smallTree:size('scn-tree-round0'),largeTree:size('scn-tree-oak0'),
   fire:[s.textures.get('scn-fire').get(0).width,s.textures.get('scn-fire').get(0).height,s.textures.get('scn-fire').frameTotal-1],
   missing:s.children.list.filter(o=>o.texture?.key==='__MISSING').length};
 });
 check(assets.obstacles===1461126806&&assets.trees===638790592,'Collision generation or tree anchors changed');
 check(assets.tiles.length===12&&assets.tiles.every(([w,h])=>w===1024&&h===1024),'Terrain exceeds mobile texture budget');
 check(String(assets.smallTree)==='48,96'&&String(assets.largeTree)==='64,80','Tree silhouettes were sliced');
 check(String(assets.fire)==='32,32,3','Fire animation must contain full two-cell frames');
 check(assets.missing===0,'Missing scenery asset');
 // Suppress discovery notifications only during the visual tour so they do not
 // cover the artwork. Real menu/control flows are exercised separately.
 await page.evaluate(()=>{battle.onNotice=()=>{}});
 if(await page.locator('#continue').isVisible())await page.locator('#continue').click();
 else {await page.locator('#play').click();await page.locator('#confirm-new').click()}
 const tour=await page.evaluate(async()=>{const {STAGES,CAMPS,BEACONS}=await import('/src/adventure.ts');return [
  ...CAMPS.map((p,i)=>({name:`camp-${i}`,x:p.x,y:p.y-35})),
  ...STAGES.map((p,i)=>({name:`stage-${i}`,x:p.x,y:p.y})),
  ...BEACONS.map((p,i)=>({name:`beacon-${i}`,x:p.x,y:p.y}))
 ]});
 for(const spot of tour){
  await page.evaluate(({x,y})=>{const s=battle;s.player.x=x;s.player.y=y;s.player.invulnerable=999;s.flightCamera.snap(x,y)},spot);
  await page.waitForTimeout(160);
  await page.screenshot({path:`output/playwright/scenery-${spot.name}.png`});
 }
 check(errors.length===0,errors.join('\n'));
 return {assets,locations:tour.length,errors};
}
