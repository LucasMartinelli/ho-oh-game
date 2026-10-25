async(page)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.reload();await page.waitForFunction(()=>window.battle?.player);await page.locator('#play').click();await page.locator('#confirm-new').click();
 const checks=await page.evaluate(()=>{
  const s=battle,p=s.player,out=[];s.scene.pause();
  try{
   for(const e of s.enemies)e.destroy();s.enemies=[];s.assist.aim=false;
   for(let row=0;row<8;row++){
    const angle=Math.PI/2-row*Math.PI/4,dx=Math.cos(angle),dy=Math.sin(angle);let spot=false;
    for(let y=4800;y<=5200&&!spot;y+=40)for(let x=900;x<=1300&&!spot;x+=40){
     if(s.world.blocked(x,y,25))continue;s.releaseInputs();p.x=x;p.y=y;p.dx=dx;p.dy=dy;p.heat=0;p.overheated=false;s.hitStop=0;s.touch.fire=true;s.touch.aimX=dx;s.touch.aimY=dy;s.update(0,16);
     const tx=s.flame.x+dx*90,ty=s.flame.y+dy*90;if(s.world.blocked(tx,ty,20)||!s.world.lineClear(s.flame.x,s.flame.y,tx,ty))continue;
     const e=s.spawn('caterpie',tx,ty,1,'direction-test');e.hp=e.maxHp=500;e.speed=0;s.update(0,16);
     if(e.hp>=500)throw Error('Sem dano na direção '+row);out.push('dano pelo bico na direção '+row);e.destroy();s.enemies.splice(s.enemies.indexOf(e),1);spot=true;
    }
    if(!spot)throw Error('Sem espaço livre para verificar direção '+row);
   }
   s.releaseInputs();p.x=700;p.y=5500;p.dx=1;p.dy=0;s.reducedEffects=false;
   for(const reduced of [false,true]){
    s.reducedEffects=reduced;s.touch.x=1;s.touch.fire=true;s.touch.aimX=1;s.touch.aimY=0;
    for(let i=0;i<30;i++){s.update(0,16);const m=p.flight.mouth(p);if(Math.hypot(m.x-s.flame.x,m.y-s.flame.y)>.001)throw Error('bico divergiu após efeitos');}
    out.push('bico alinhado com efeitos suaves '+reduced);
   }
   s.releaseInputs();p.x=700;p.y=5500;s.flightCamera.snap(p.x,p.y);
  }finally{s.scene.resume()}
  return out;
 });if(errors.length)throw Error(errors.join(';'));return{checks:checks.length,errors};
}
