async(page)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width:390,height:844});await page.waitForFunction(()=>window.battle?.discoveries);await page.locator('#play').click();await page.locator('#confirm-new').click();await page.waitForTimeout(200);
 const checks=[];const check=(v,m)=>{if(!v)throw Error(m);checks.push(m)};
 // Actual independent two-thumb input: move left while aiming right.
 const cdp=await page.context().newCDPSession(page);await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});const st=await page.locator('#touch-stick').boundingBox(),fi=await page.locator('#touch-fire').boundingBox();const a={id:1,x:st.x+st.width/2,y:st.y+st.height/2},b={id:2,x:fi.x+fi.width/2,y:fi.y+fi.height/2};const before=await page.evaluate(()=>battle.player.x);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[a,b]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...a,x:a.x-30},{...b,x:b.x+28}]});await page.waitForTimeout(250);check(await page.evaluate(x=>battle.player.x<x&&battle.player.dx>.9&&battle.flame.active,before),'Recuar enquanto mira e atira para a direita');
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...a,x:a.x-30},{...b,x:b.x+24,y:b.y-24}]});await page.waitForTimeout(120);check(await page.evaluate(()=>battle.player.dx>.6&&battle.player.dy<-.6),'Mira diagonal independente');await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});await page.waitForTimeout(100);check(await page.evaluate(()=>!battle.touch.fire&&!battle.touch.aimX&&!battle.touch.x),'Cancelamento libera ambos os controles');
 await page.evaluate(()=>battle.pause());
 // Deterministic isolated attack simulation; game loop remains paused.
 const attacks=await page.evaluate(()=>{
  const s=battle;const results=[];s.player.x=1800;s.player.y=4200;s.player.invulnerable=0;
  for(const kind of ['rattata','squirtle','bulbasaur','charizard','blastoise','venusaur','dragonite']){
   s.combat.clear();const e=s.spawn(kind,1800,4000,1,'qa-'+kind);e.x=1800;e.y=4000;e.aggro=true;e.attack.time=0;
   // Direct warning requires a clear ray; choose nearby reachable coordinates.
   let found=false;for(let d=90;d<230&&!found;d+=20)for(let a=0;a<6.28;a+=.3){const x=e.x+Math.cos(a)*d,y=e.y+Math.sin(a)*d;if(!s.world.blocked(x,y,22)&&s.world.lineClear(e.x,e.y,x,y)){s.player.x=x;s.player.y=y;found=true;break}}
   s.encounters.update(e,.01);const windup=e.attack.phase==='windup',before=s.combat.bullets.filter(b=>b.active).length,locked={angle:e.attack.angle,x:e.attack.tx,y:e.attack.ty};s.player.x+=35;s.player.y+=25;s.encounters.update(e,.1);
   const fixed=locked.angle===e.attack.angle&&locked.x===e.attack.tx&&locked.y===e.attack.ty;s.encounters.update(e,2);const pattern=e.attack.pattern;
   s.encounters.update(e,1);const recovery=e.attack.phase==='recover';const hp=e.hp;s.damage(e,10);const bonus=Math.round((hp-e.hp)*10)/10;
   results.push({kind,windup,before,fixed,pattern,recovery,bonus});
   e.destroy();s.enemies.splice(s.enemies.indexOf(e),1);
  }return results;
 });
 for(const r of attacks){check(r.windup&&r.before===0&&r.fixed,'Aviso antes do ataque e alvo fixo: '+r.kind);check(r.recovery,'Recuperação: '+r.kind);if(['charizard','blastoise','venusaur','dragonite'].includes(r.kind))check(r.bonus===13.5,'Contra-ataque causa +35%: '+r.kind)}
 const patterns=await page.evaluate(()=>{const s=battle,result=[];for(const kind of ['charizard','blastoise','venusaur','dragonite']){const e=s.spawn(kind,1800,4200,1,'qa-pattern-'+kind);s.player.x=e.x+90;s.player.y=e.y;const used=[];for(let i=0;i<2;i++){e.attack.phase='idle';e.attack.time=0;s.encounters.update(e,.01);used.push(e.attack.pattern);s.encounters.update(e,2);s.encounters.update(e,1)}result.push({kind,used});e.destroy();s.enemies.splice(s.enemies.indexOf(e),1)}return result});for(const r of patterns)check(new Set(r.used).size===2,'Dois padrões: '+r.kind);
 const discoveries=await page.evaluate(()=>{const s=battle,d=s.discoveries;return d.sites.map(site=>({free:!s.world.blocked(site.x,site.y,22),points:site.points.every(p=>!s.world.blocked(p.x,p.y,22)),distinct:new Set(site.points.map(p=>p.x+','+p.y)).size}))});check(discoveries.every(s=>s.free&&s.points&&s.distinct===3),'Quatro descobertas em posições livres e trilha distinta');
 await page.evaluate(()=>{const s=battle,d=s.discoveries;s.player.x=d.sites[0].x;s.player.y=d.sites[0].y;s.flightCamera.snap(s.player.x,s.player.y);s.state='playing';d.update(0);s.state='paused';s.onChange()});
 await page.evaluate(()=>{battle.state='playing';battle.interact();battle.state='paused'});check(await page.evaluate(()=>battle.cleared.has('discovery-0')),'Baú concede recompensa');const xp=await page.evaluate(()=>battle.progress.xp);await page.evaluate(()=>battle.discoveries.interact(0));check(await page.evaluate(x=>battle.progress.xp===x,xp),'Baú não duplica recompensa');
 await page.evaluate(()=>{const s=battle,d=s.discoveries;d.interact(1);for(const p of d.sites[1].points){s.player.x=p.x;s.player.y=p.y;d.update(.01)}});check(await page.evaluate(()=>battle.cleared.has('discovery-1')),'Trilha de três círculos concluída');
 await page.evaluate(()=>{const s=battle,d=s.discoveries;d.interact(2);s.player.x=d.sites[2].x;s.player.y=d.sites[2].y;for(const e of [...s.enemies])if(e.id.startsWith('secret-2-'))s.damage(e,99999);d.update(.01)});check(await page.evaluate(()=>battle.cleared.has('discovery-2')),'Encontro opcional concede recompensa após vencer');
 await page.evaluate(()=>{battle.discoveries.interact(3);battle.save();battle.start(true)});check(await page.evaluate(()=>battle.discoveries.completed===4),'Descobertas persistem após carregar');
 await page.evaluate(()=>{battle.start(false,'easy');battle.discoveries.interact(1);battle.discoveries.remaining=.01;const p=battle.discoveries.sites[1];battle.player.x=p.x;battle.player.y=p.y;battle.discoveries.update(.1)});check(await page.evaluate(()=>battle.discoveries.active===-1&&!battle.cleared.has('discovery-1')),'Tempo esgotado permite tentar novamente sem recompensa');
 await page.evaluate(()=>{const d=battle.discoveries;d.interact(1);battle.player.x=d.sites[1].x;battle.player.y=d.sites[1].y;battle.flightCamera.snap(battle.player.x,battle.player.y)});await page.waitForTimeout(150);await page.screenshot({path:'output/playwright/gameplay-trail.png'});
 check(errors.length===0,'Sem erros JavaScript');return{checks:checks.length,attacks,patterns,discoveries,errors};
}
