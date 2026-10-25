async(page)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));const checks=[];const check=(v,m)=>{if(!v)throw Error(m);checks.push(m)};
 await page.waitForFunction(()=>window.battle?.player);await page.locator('#play').click();await page.locator('#confirm-new').click();await page.waitForTimeout(200);
 await page.evaluate(()=>{const s=battle;s.releaseInputs();s.reducedEffects=true;s.player.invulnerable=999;s.player.heat=0;for(const e of s.enemies)e.destroy();s.enemies=[];s.scene.pause();document.querySelector('#notice').style.display='none';});
 const dirs=[['s',0,1,0],['se',Math.SQRT1_2,Math.SQRT1_2,1],['e',1,0,2],['ne',Math.SQRT1_2,-Math.SQRT1_2,3],['n',0,-1,4],['nw',-Math.SQRT1_2,-Math.SQRT1_2,5],['w',-1,0,6],['sw',-Math.SQRT1_2,Math.SQRT1_2,7]];
 const info=[];
 for(const [name,dx,dy,row] of dirs){
  const result=await page.evaluate(({dx,dy,row})=>{const s=battle,p=s.player;s.releaseInputs();p.x=700;p.y=5500;p.dx=dx;p.dy=dy;p.heat=0;p.overheated=false;s.touch.fire=true;s.touch.aimX=dx;s.touch.aimY=dy;s.assist.aim=false;s.update(0,16);s.flightCamera.snap(p.x,p.y);const mouth=p.flight.mouth(p);
   return{direction:p.flight.direction,key:p.sprite.texture.key,frame:Number(p.sprite.frame.name),origin:[s.flame.x-p.sprite.x,s.flame.y-p.sprite.y],aligned:Math.hypot(mouth.x-s.flame.x,mouth.y-s.flame.y)<.001,angle:s.flame.angle,flip:p.sprite.flipX,x:p.x,y:p.y};},{dx,dy,row});
  check(result.direction===row,`${name}: direção correta`);check(result.key==='hooh-Shoot'&&!result.flip,`${name}: pose própria, sem espelhamento`);check(result.aligned,`${name}: fogo acompanha bico`);check(Math.abs(Math.atan2(Math.sin(result.angle-Math.atan2(dy,dx)),Math.cos(result.angle-Math.atan2(dy,dx))))<1e-9,`${name}: mira exata`);check(result.x===700&&result.y===5500,`${name}: giro não move personagem`);
  await page.waitForTimeout(70);await page.screenshot({path:`output/playwright/hooh-direction-${name}.png`});info.push({name,...result});
 }
 const more=await page.evaluate(()=>{
  const s=battle,p=s.player,out=[];const ok=(v,m)=>{if(!v)throw Error(m);out.push(m)};s.releaseInputs();p.flight.reset();p.dx=1;p.dy=0;p.renderFlight(0,.016,0,0,false,true);ok(p.flight.state==='Idle','repouso animado');
  p.renderFlight(0,.016,1,0,false,true);ok(p.flight.state==='Walk','voo animado');const seen=new Set();for(let i=0;i<70;i++){p.renderFlight(0,.016,1,0,false,true);seen.add(p.flight.frame)}ok(seen.size===5,'cinco quadros de voo');
  p.dx=Math.cos(Math.PI/8);p.dy=Math.sin(Math.PI/8);const start=p.flight.direction;for(let i=0;i<30;i++){const a=Math.PI/8+(i%2?.01:-.01);p.dx=Math.cos(a);p.dy=Math.sin(a);p.renderFlight(0,.016,0,0,true,true)}ok(p.flight.direction===start,'sem tremor na fronteira de direções');
  p.dx=0;p.dy=-1;p.renderFlight(0,.016,0,0,true,true);ok(p.flight.direction===4,'virada responde no mesmo quadro');
  s.releaseInputs();s.touch.x=1;s.touch.y=-1;s.update(0,16);s.touch.y=0;s.update(0,16);ok(p.dy===0&&p.dx===1,'soltar diagonal atualiza direção imediatamente');
  s.releaseInputs();p.x=700;p.y=5500;p.dx=-1;p.dy=0;p.dashCooldown=0;s.touch.x=1;s.touch.fire=true;s.touch.aimX=-1;s.requestDash();s.update(0,16);ok(p.flight.direction===2,'pose do impulso segue trajetória');
  s.pause();s.pause();ok(p.dashTime===0,'pausa continua cancelando impulso');s.scene.resume();return out;
 });checks.push(...more);check(!errors.length,'sem erros JS');return{checks:checks.length,directions:info.map(i=>({name:i.name,origin:i.origin})),errors};
}
