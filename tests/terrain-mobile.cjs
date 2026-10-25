// Run against the development server in an isolated mobile CLI session.
async(page)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const check=(value,message)=>{if(!value)throw Error(message)};
 await page.addInitScript(()=>{
  const getContext=HTMLCanvasElement.prototype.getContext;
  window.terrainCanvasSizes=[];
  HTMLCanvasElement.prototype.getContext=function(type,...args){
   if(type==='2d'){
    window.terrainCanvasSizes.push([this.width,this.height]);
    // Exercise a bounded canvas budget, including temporary surfaces that the
    // old tile-size-only test could not see after world construction.
    if(this.width>1024||this.height>1024)throw Error(`Oversized 2D canvas: ${this.width}x${this.height}`);
   }
   return getContext.call(this,type,...args);
  };
 });
 await page.setViewportSize({width:390,height:844});await page.reload();
 await page.waitForFunction(()=>window.battle?.player);
 await page.locator('#play').click();await page.locator('#confirm-new').click();
 const terrain=await page.evaluate(async()=>{
  const {STAGES}=await import('/src/adventure.ts'),s=battle;
  const pixel=(x,y)=>{const tx=Math.floor(x/2048)*1024,ty=Math.floor(y/2048)*1024;return [...s.textures.get(`terrain-${tx}-${ty}`).context.getImageData(Math.floor(x/2)-tx,Math.floor(y/2)-ty,1,1).data]};
  const hash=values=>{let h=2166136261;for(const v of values)h=Math.imul(h^v,16777619)>>>0;return h};
  return {
   sizes:window.terrainCanvasSizes,
   tiles:s.textures.getTextureKeys().filter(k=>k.startsWith('terrain-')).length,
   land:STAGES.map(p=>({name:p.name,pixel:pixel(p.x,p.y)})),
   // Ocean samples on both sides of horizontal and vertical tile boundaries.
   seams:[[2048,800],[4096,1000],[6144,5500],[1000,2048],[7500,4096]].map(([x,y])=>[pixel(x-2,y-2),pixel(x,y)]),
   obstacles:hash(new TextEncoder().encode(JSON.stringify(s.world.obstacles))),
   trees:hash(new TextEncoder().encode(JSON.stringify(s.world.trees.map(t=>[t.x,t.y,t.phase])))),
   postFX:s.cameras.main.postPipelines.length
  };
 });
 check(terrain.tiles===12&&terrain.sizes.every(([w,h])=>w<=1024&&h<=1024),'Canvas budget exceeded');
 check(terrain.land.every(({pixel:[r,g,b,a]})=>a===255&&(g>b||r>b)),'An island was painted as ocean');
 check(terrain.seams.every(pair=>pair.every(([r,g,b,a])=>a===255&&b>g&&g>r)),'Missing ocean at a tile seam');
 check(terrain.obstacles===3481088923&&terrain.trees===638790592,'World geometry changed: existing saves must keep the same obstacles');
 check(terrain.postFX===0,'Heavy post-processing enabled on mobile');
 for(const [region,x,y] of [['forest',1800,4200],['lake',4500,4400],['ash',6000,2700],['sky',7000,800],['seam',4096,4400]]){
  await page.evaluate(({x,y})=>{const s=battle;s.player.x=x;s.player.y=y;s.player.invulnerable=999;s.flightCamera.snap(x,y)}, {x,y});
  await page.waitForTimeout(150);
  await page.screenshot({path:`output/playwright/terrain-${page.context().browser().browserType().name()}-${region}.png`,scale:'css'});
 }
 await page.setViewportSize({width:844,height:390});await page.waitForTimeout(150);
 await page.screenshot({path:`output/playwright/terrain-${page.context().browser().browserType().name()}-landscape.png`,scale:'css'});
 await page.locator('#pause').click();await page.locator('#pause-map').click();
 check(await page.locator('#map').isVisible(),'Map unavailable');await page.locator('#map .panel-close').click();
 check(errors.length===0,errors.join('\n'));
 return {tiles:terrain.tiles,landSamples:terrain.land.length,seams:terrain.seams.length,geometry:'unchanged',canvasBudget:'1024x1024',errors};
}
