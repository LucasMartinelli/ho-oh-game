// Audit the feet of settlement objects against existing trunks, rocks and ponds.
async page=>{
 await page.reload();await page.waitForFunction(()=>window.battle?.player);
 return await page.evaluate(async()=>{
  const {CAMPS}=await import('/src/adventure.ts'),{SETTLEMENT_LAYOUTS}=await import('/src/settlements.ts');
  const overlaps=[];
  CAMPS.forEach((p,i)=>{
   const plan=SETTLEMENT_LAYOUTS[i],props={...plan,pot:[plan.house[0]+34,plan.house[1]+4],fence:[plan.garden[0],plan.garden[1]+24]};
   for(const kind of Object.keys(props)){
    const pos=props[kind];if(!pos)continue;
    const x=p.x+pos[0],y=p.y+pos[1],half=kind==='house'||kind==='annex'?44:kind==='bench'?22:12;
    for(const o of battle.world.obstacles){const dx=Math.max(0,Math.abs(x-o.x)-half),dy=Math.max(0,Math.abs(y-o.y)-6);if(Math.hypot(dx,dy)<o.r)overlaps.push({camp:i,kind,obstacle:{x:Math.round(o.x),y:Math.round(o.y),r:o.r}})}
   }
  });if(overlaps.length)throw Error(JSON.stringify(overlaps));return {overlaps};
 });
}
