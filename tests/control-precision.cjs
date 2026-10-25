async(page)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));const checks=[];const check=(v,m)=>{if(!v)throw Error(m);checks.push(m)};
 await page.reload();await page.waitForFunction(()=>window.battle?.player);await page.locator('#play').click();await page.locator('#confirm-new').click();
 const simulated=await page.evaluate(()=>{
  const s=battle,p=s.player,out=[];const ok=(v,m)=>{if(!v)throw Error(m);out.push(m)};s.scene.pause();
  const descriptor=Object.getOwnPropertyDescriptor(navigator,'getGamepads');let live=[];Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>live});
  const reset=()=>{s.releaseInputs();p.x=700;p.y=5500;p.dx=-1;p.dy=0;p.dashCooldown=0;p.dashTime=0;s.hitStop=0;s.state='playing'};
  const step=(n=1)=>{for(let i=0;i<n;i++)s.update(0,16)};
  const pad={connected:true,index:0,axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false}))};
  try{
   reset();step(120);ok(p.x===700&&p.y===5500,'parado por 120 quadros sem deriva');
   for(const [x,y] of [[1,0],[-1,0],[0,1],[0,-1],[Math.SQRT1_2,Math.SQRT1_2],[-Math.SQRT1_2,-Math.SQRT1_2]]){
    reset();s.touch.x=x;s.touch.y=y;step();ok(Math.abs(p.x-700-x*3.36)<1e-6&&Math.abs(p.y-5500-y*3.36)<1e-6,'velocidade e direção corretas '+x+','+y);s.touch.x=s.touch.y=0;const a=p.x,b=p.y;step(20);ok(p.x===a&&p.y===b,'soltura sem inércia '+x+','+y);
   }
   reset();s.touch.x=1;s.touch.fire=true;s.touch.aimX=-1;s.requestDash();step();const start=p.x;s.touch.x=0;step();ok(p.x>start,'impulso não inverte ao soltar movimento mirando atrás');step(20);const end=p.x;step(20);ok(p.x===end,'impulso termina sem deriva');
   reset();s.requestDash();step();s.pause();s.pause();const a=p.x,b=p.y;step(20);ok(p.x===a&&p.y===b&&p.dashTime===0,'pausa cancela impulso');
   reset();live=[pad];step();pad.axes=[.1,-.1,0,0];step(20);ok(p.x===700&&p.y===5500,'ruído analógico dentro da zona morta não move');
   pad.axes=[.26,0,0,0];step();ok(p.x>700&&p.x<700.1,'pequeno movimento analógico não vira velocidade máxima');
   pad.axes=[1,0,0,0];step();pad.connected=false;const stop=p.x;step(20);ok(p.x===stop&&s.padMove.x===0,'controle desconectado não deixa movimento preso');
   pad.connected=true;step(10);ok(p.x===stop,'reconexão exige retornar ao neutro');pad.axes=[0,0,0,0];step();pad.axes=[1,0,0,0];step();ok(p.x>stop,'controle volta após neutro');
   s.pause();s.pause();const paused=p.x;step(10);ok(p.x===paused,'retomada não herda analógico inclinado');pad.axes=[0,0,0,0];step();pad.axes=[1,0,0,0];s.touch.x=0;s.touch.y=-1;const x=p.x;step();ok(p.x===x,'analógico não desvia direcional touch');
   s.touch.x=s.touch.y=0;s.keys.W.isDown=true;const keyX=p.x;step();ok(p.x===keyX,'analógico não desvia teclado');s.keys.W.isDown=false;
   pad.axes=[0,0,0,0];step();p.dashCooldown=.1;pad.buttons[1].pressed=true;step();pad.connected=false;step(15);ok(p.dashTime===0&&s.dashBuffer===0,'desconexão cancela impulso pendente');
   reset();live=[];s.touch.fire=true;s.touch.aimX=1;step(30);ok(p.x===700&&p.y===5500,'atacar sozinho não desloca posição');
   reset();s.save();const save=JSON.parse(localStorage.getItem('hooh-adventure-v2'));ok(save.version===2&&save.worldRevision===3,'formato de save preservado');
  }finally{if(descriptor)Object.defineProperty(navigator,'getGamepads',descriptor);else delete navigator.getGamepads;reset();s.scene.resume()}
  return out;
 });checks.push(...simulated);
 const pos=()=>page.evaluate(()=>({x:battle.player.x,y:battle.player.y}));const unchanged=async(label)=>{const a=await pos();await page.waitForTimeout(180);const b=await pos();check(Math.hypot(a.x-b.x,a.y-b.y)<.001,label)};
 await page.keyboard.down('d');await page.waitForTimeout(100);await page.keyboard.up('d');await unchanged('soltar teclado para imediatamente');
 await page.keyboard.down('w');await page.keyboard.down('d');await page.waitForTimeout(90);await page.keyboard.up('d');const x=(await pos()).x;await page.waitForTimeout(90);check(Math.abs((await pos()).x-x)<.001,'soltar parte da diagonal não mantém eixo');await page.keyboard.up('w');await unchanged('soltar diagonal para');
 await page.keyboard.down('d');await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await page.keyboard.up('d');check(await page.evaluate(()=>battle.state==='paused'&&!battle.keys.D.isDown),'perda de foco pausa e libera teclado');await page.locator('#resume').click();await unchanged('retomar após foco não move sozinho');
 const cdp=await page.context().newCDPSession(page);await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
 for(const [width,height] of [[390,844],[844,390]]){
  await page.setViewportSize({width,height});await page.waitForTimeout(200);
  const box=await page.locator('#touch-stick').boundingBox(),fire=await page.locator('#touch-fire').boundingBox();
  const a={id:1,x:box.x+box.width/2,y:box.y+box.height/2},b={id:2,x:fire.x+fire.width/2,y:fire.y+fire.height/2};
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[a,b]});await unchanged(width+': centro do direcional e fogo não movem');
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...a,x:a.x+26},b]});await page.waitForTimeout(90);
  check(await page.evaluate(()=>battle.touch.x===1&&battle.touch.y===0&&battle.touch.fire),width+': movimento e fogo independentes');
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[{...a,x:a.x+26}]});await unchanged(width+': soltar movimento mantendo fogo para personagem');
  check(await page.evaluate(()=>battle.touch.fire&&!battle.touch.x&&!battle.touch.y),width+': fogo continua após soltar movimento');
  await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});check(await page.evaluate(()=>!battle.touch.fire&&!battle.touch.x),width+': cancelar libera toque');
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...a,x:a.x+25}]});await page.waitForTimeout(50);
  await page.evaluate(()=>battle.pause());await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.locator('#resume').click();await unchanged(width+': pausa limpa dedo mantido');
  await page.screenshot({path:`output/playwright/control-precision-${width}.png`});
 }
 await cdp.detach();check(!errors.length,'sem exceções JavaScript');return{checks:checks.length,errors};
}
