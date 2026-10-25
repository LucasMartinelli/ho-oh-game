import type {BattleScene} from './scene';

/** Each thumb owns its pointer; captures keep controls reliable outside their bounds. */
export function installTouchControls(scene:BattleScene){
 const stick=document.getElementById('touch-stick')!,knob=stick.querySelector<HTMLElement>('.stick-knob')!,fire=document.getElementById('touch-fire')!,dash=document.getElementById('touch-dash')!;
 let moveId:number|undefined,fireId:number|undefined;
 const move=(event:PointerEvent)=>{
  if(event.pointerId!==moveId)return;
  const box=stick.getBoundingClientRect(),radius=box.width*.32;
  let x=event.clientX-box.left-box.width/2,y=event.clientY-box.top-box.height/2;
  const length=Math.hypot(x,y);if(length>radius){x*=radius/length;y*=radius/length}
  knob.style.transform=`translate(${x}px,${y}px)`;
  if(length<9){scene.touch.x=scene.touch.y=0;return}
  // Eight stable directions with hysteresis: switch sector only past ±30°.
  const angle=Math.atan2(y,x);let sector=Math.round(angle/(Math.PI/4));
  const current=Math.atan2(scene.touch.y,scene.touch.x);
  if((scene.touch.x||scene.touch.y)&&Math.abs(Math.atan2(Math.sin(angle-current),Math.cos(angle-current)))<Math.PI/8+.14)sector=Math.round(current/(Math.PI/4));
  const qa=sector*Math.PI/4;
  scene.touch.x=Math.abs(Math.cos(qa))<.01?0:Math.cos(qa);
  scene.touch.y=Math.abs(Math.sin(qa))<.01?0:Math.sin(qa);
 };
 const releaseMove=(event?:PointerEvent)=>{if(event&&event.pointerId!==moveId)return;moveId=undefined;scene.touch.x=scene.touch.y=0;knob.style.transform='translate(0px,0px)';stick.classList.remove('pressed')};
 const releaseFire=(event?:PointerEvent)=>{if(event&&event.pointerId!==fireId)return;fireId=undefined;scene.touch.fire=false;scene.touch.aimX=scene.touch.aimY=0;fire.style.removeProperty('--aim-angle');fire.classList.remove('pressed')};
 stick.onpointerdown=event=>{if(scene.state!=='playing'||moveId!==undefined)return;event.preventDefault();moveId=event.pointerId;stick.setPointerCapture(moveId);stick.classList.add('pressed');move(event)};
 stick.onpointermove=move;stick.onpointerup=stick.onpointercancel=stick.onlostpointercapture=releaseMove;
 fire.onpointerdown=event=>{if(scene.state!=='playing'||fireId!==undefined)return;event.preventDefault();fireId=event.pointerId;fire.setPointerCapture(fireId);scene.touch.fire=true;scene.touch.aimX=scene.player.dx;scene.touch.aimY=scene.player.dy;fire.style.setProperty('--aim-angle',`${Math.atan2(scene.player.dy,scene.player.dx)}rad`);fire.classList.add('pressed')};
 fire.onpointermove=event=>{if(event.pointerId!==fireId)return;const box=fire.getBoundingClientRect(),x=event.clientX-box.left-box.width/2,y=event.clientY-box.top-box.height/2,length=Math.hypot(x,y);if(length<12)return;scene.touch.aimX=x/length;scene.touch.aimY=y/length;fire.style.setProperty('--aim-angle',`${Math.atan2(y,x)}rad`)};
 fire.onpointerup=fire.onpointercancel=fire.onlostpointercapture=releaseFire;
 dash.onpointerdown=event=>{event.preventDefault();if(scene.state==='playing')scene.touch.dash=true};
 const reset=()=>{releaseMove();releaseFire();scene.touch.dash=false};
 window.addEventListener('blur',reset);window.addEventListener('resize',reset);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)reset()});
 for(const element of [stick,fire,dash])element.addEventListener('contextmenu',event=>event.preventDefault());
 return reset;
}
