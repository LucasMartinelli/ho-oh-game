async(page)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));const checks=[];
 const check=(v,m)=>{if(!v)throw Error(m);checks.push(m)};
 await page.locator('#play').click();await page.locator('#confirm-new').click();
 await page.waitForFunction(()=>window.battle?.state==='playing');
 const results=await page.evaluate(()=>{
  const s=window.battle,p=s.player,out=[];const ok=(v,m)=>{if(!v)throw Error(m);out.push(m)};
  s.scene.pause();
  try{
   for(const mode of ['easy','hard']){
    s.start(false,mode);s.hitStop=0;
    const e=s.spawn('venusaur',p.x+180,p.y,2,'review',0);
    for(const species of ['venusaur','blastoise','charizard','dragonite','bulbasaur','squirtle','rattata','pidgey','zubat'])for(const phase2 of [false,true]){
     e.species=species;e.boss=['venusaur','blastoise','charizard','dragonite'].includes(species);e.hp=e.maxHp*(phase2?.4:1);
     for(let turn=0;turn<3;turn++){
      const duration=assist=>{s.assist.telegraph=assist;s.encounters.reset(e);e.attack.time=0;e.attack.turn=turn;e.patternRun=0;e.lastPattern='';s.encounters.update(e,.016);return e.attack.duration};
      const normal=duration(false),assisted=duration(true);ok(normal>0&&Math.abs(assisted-normal*1.3)<1e-8,`${mode}/${species}/${phase2}/${turn}: aviso +30%`);
     }
    }
    e.destroy();s.enemies.splice(s.enemies.indexOf(e),1);
    p.dashCooldown=.12;p.dashTime=0;s.requestDash();for(let i=0;i<4;i++)s.update(0,40);ok(p.dashTime>0,'buffer dispara ao terminar recarga');
    p.heat=90;p.overheated=true;s.perfect();const cd=p.dashCooldown;s.perfect();ok(p.dashCooldown===cd&&p.heat===0&&!p.overheated,'recompensa única por impulso');
    p.dashCooldown=0;p.dashTime=0;s.requestDash();s.update(0,16);s.perfect();ok(p.dashCooldown<1.4,'novo impulso permite nova recompensa');
    p.dashCooldown=.12;p.dashTime=0;s.requestDash();s.cancelDash();for(let i=0;i<5;i++)s.update(0,40);ok(p.dashTime===0,'soltar cancela buffer');
    p.dashCooldown=.3;s.requestDash();for(let i=0;i<10;i++)s.update(0,40);ok(p.dashTime===0,'pedido antecipado demais expira');
    p.dashCooldown=.1;s.requestDash();s.pause();s.pause();for(let i=0;i<4;i++)s.update(0,40);ok(p.dashTime===0,'pausa limpa buffer');
    p.hp=p.maxHp-1;s.ash=1;s.useAsh();s.update(0,40);ok(p.hp===p.maxHp&&s.ashHeal===0,'Cinza termina ao encher vida');p.hp-=20;s.update(0,40);ok(p.hp===p.maxHp-20,'cura antiga não reaparece');
    s.ashHeal=30;s.respawn();ok(s.ashHeal===0,'renascer limpa cura');s.ashHeal=30;s.interact();ok(s.ashHeal===0,'refúgio limpa cura');
   }
   s.start(false,'easy');s.hitStop=0;
   const front=s.spawn('caterpie',p.x+170,p.y+45,1,'front',0),rear=s.spawn('caterpie',p.x-65,p.y-20,1,'rear',0);
   front.aggro=rear.aggro=true;s.touch.fire=true;s.touch.aimX=1;s.touch.aimY=0;s.assist.aim=true;
   s.update(0,16);ok(p.dy>0&&p.dx>.98,'mira prefere alvo no cone ao alvo próximo atrás');
   front.aggro=rear.aggro=false;s.touch.aimX=1;s.touch.aimY=0;s.update(0,16);ok(Math.abs(p.dy)<1e-9,'sem alvo no cone mantém direção');
   s.assist.aim=false;front.aggro=true;s.update(0,16);ok(Math.abs(p.dy)<1e-9,'assistência desligada mantém direção');
   s.start(false,'easy');s.hitStop=0;
  }finally{s.scene.resume()}
  return out;
 });checks.push(...results);
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(250);
 const cdp=await page.context().newCDPSession(page);await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
 const center=async(id,n)=>{const r=await page.locator(id).boundingBox();return{x:r.x+r.width/2,y:r.y+r.height/2,id:n}};
 const a=await center('#touch-stick',1),b=await center('#touch-fire',2),d=await center('#touch-dash',3);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[a,b]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...a,x:a.x+25,y:a.y-25},b]});await page.waitForTimeout(120);
 check(await page.evaluate(()=>battle.touch.fire&&battle.touch.x>0&&battle.touch.y<0&&battle.player.heat>0),'movimento e fogo simultâneos');
 await page.evaluate(()=>{battle.player.dashCooldown=.12});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...a,x:a.x+25,y:a.y-25},b,d]});await page.waitForTimeout(150);
 check(await page.evaluate(()=>battle.player.dashCooldown>1&&battle.touch.fire&&battle.touch.x>0),'terceiro dedo usa buffer sem interromper outros comandos');
 await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
 check(await page.evaluate(()=>!battle.touch.fire&&!battle.touch.x&&!battle.touch.y&&battle.dashBuffer===0),'cancelamento libera todos os dedos');
 await page.locator('#pause').click();await page.locator('#pause-map').click();check(await page.locator('#map').isVisible(),'mapa mobile');await page.locator('#map .panel-close').click();
 await page.locator('#pause').click();await page.locator('#pause-skills').click();check(await page.locator('#skills').isVisible(),'habilidades mobile');await page.locator('#skills .panel-close').click();
 for(const [width,height] of [[390,844],[844,390]]){
  await page.setViewportSize({width,height});await page.waitForTimeout(200);
  await page.evaluate(()=>{battle.player.heat=85;battle.player.overheated=false;battle.onChange();battle.scene.pause()});
  check(await page.locator('#touch-fire').getAttribute('class').then(c=>c.includes('heat-warning')),'aviso antes de superaquecer');
  await page.screenshot({path:`output/playwright/refinements-${width}.png`});
  await page.evaluate(()=>{battle.player.heat=100;battle.player.overheated=true;battle.onChange()});
  check(await page.locator('.fire-heat-warning').textContent()==='ESFRIANDO','estado de resfriamento');
  await page.screenshot({path:`output/playwright/refinements-hot-${width}.png`});
  await page.evaluate(()=>{battle.player.heat=0;battle.player.overheated=false;battle.scene.resume()});
 }
 await cdp.detach();await page.setViewportSize({width:1280,height:720});await page.waitForTimeout(200);
 await page.keyboard.down('d');await page.keyboard.down('Space');await page.waitForTimeout(100);check(await page.evaluate(()=>battle.keys.D.isDown&&battle.player.heat>0),'teclado move e dispara');await page.keyboard.up('d');await page.keyboard.up('Space');
 await page.evaluate(()=>{battle.player.dashCooldown=0});await page.keyboard.down('Shift');await page.waitForTimeout(50);check(await page.evaluate(()=>battle.player.dashCooldown>0),'impulso no teclado');await page.keyboard.up('Shift');
 await page.mouse.move(900,300);await page.mouse.down();await page.waitForTimeout(80);check(await page.evaluate(()=>battle.pointerFire),'fogo pelo mouse');await page.mouse.up();
 await page.evaluate(()=>window.dispatchEvent(new Event('blur')));check(await page.evaluate(()=>!battle.touch.fire&&battle.dashBuffer===0),'perda de foco libera toque');
 check(errors.length===0,'sem exceções JavaScript');return{checks:checks.length,errors};
}
