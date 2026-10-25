// Run on the dev server in an isolated playwright-cli session.
async page => {
 const context=await page.context().browser().newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
 const mobile=await context.newPage(),errors=[],checks=[];
 mobile.on('pageerror',e=>errors.push(e.message));
 const check=(v,m)=>{if(!v)throw Error(m);checks.push(m)};
 try{
  await mobile.addInitScript(()=>{
   const original=HTMLCanvasElement.prototype.getContext;window.canvasBudget=[];
   HTMLCanvasElement.prototype.getContext=function(kind,...args){if(kind==='2d'){window.canvasBudget.push([this.width,this.height]);if(this.width>1024||this.height>1024)throw Error('Oversize terrain canvas')}return original.call(this,kind,...args)};
  });
  await mobile.goto(page.url().split('/').slice(0,3).join('/'));await mobile.waitForFunction(()=>window.battle?.player);
  await mobile.locator('#play').click();await mobile.locator('#confirm-new').click();await mobile.waitForTimeout(700);
  check(await mobile.evaluate(()=>battle.cameras.main.postPipelines.length===0),'No mobile post-processing');
  check(await mobile.evaluate(()=>window.canvasBudget.every(([w,h])=>w<=1024&&h<=1024)),'Bounded 2D canvas allocation');
  const cdp=await context.newCDPSession(mobile);
  const stick=await mobile.locator('#touch-stick').boundingBox(),fire=await mobile.locator('#touch-fire').boundingBox();
  const a={x:stick.x+stick.width/2,y:stick.y+stick.height/2,id:1},b={x:fire.x+fire.width/2,y:fire.y+fire.height/2,id:2};
  const start=await mobile.evaluate(()=>({x:battle.player.x,y:battle.player.y}));
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[a,b]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...a,x:a.x+24,y:a.y-24},b]});await mobile.waitForTimeout(300);
  check(await mobile.evaluate(p=>battle.touch.fire&&battle.player.heat>0&&Math.hypot(battle.player.x-p.x,battle.player.y-p.y)>10,start),'Simultaneous move + fire');
  await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
  check(await mobile.evaluate(()=>!battle.touch.fire&&!battle.touch.x&&!battle.touch.y),'Touch cancellation releases input');
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[b]});
  await mobile.evaluate(()=>battle.pause());
  check(await mobile.evaluate(()=>!battle.touch.fire&&!battle.touch.x&&!battle.touch.y),'Pause releases input');
  await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
  await mobile.locator('#pause-map').click();check(await mobile.locator('#map').isVisible(),'Mobile map accessible');
  await mobile.locator('#map .panel-close').click();
  await mobile.locator('#pause').click();await mobile.locator('#pause-skills').click();check(await mobile.locator('#skills').isVisible(),'Mobile skills accessible');await mobile.locator('#skills .panel-close').click();
  await mobile.evaluate(()=>{battle.onNotice=()=>{};battle.player.x=700;battle.player.y=5500;battle.flightCamera.snap(700,5500)});
  await mobile.waitForTimeout(3500);
  for(const [width,height] of [[390,844],[844,390]]){
   await mobile.setViewportSize({width,height});await mobile.waitForTimeout(250);
   check(await mobile.evaluate(()=>document.documentElement.scrollWidth===innerWidth&&document.documentElement.scrollHeight===innerHeight),'No viewport overflow '+width);
   await mobile.screenshot({path:`output/playwright/scenery-mobile-${width}.png`});
  }
  check(errors.length===0,errors.length?errors.join('\n'):'No JavaScript errors');
  return {checks,errors};
 }finally{await context.close()}
}
