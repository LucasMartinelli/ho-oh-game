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
  // Eight stable directions match the keyboard, including diagonals.
  const angle=Math.round(Math.atan2(y,x)/(Math.PI/4))*Math.PI/4;
  scene.touch.x=Math.abs(Math.cos(angle))<.01?0:Math.cos(angle);
  scene.touch.y=Math.abs(Math.sin(angle))<.01?0:Math.sin(angle);
 };
 const releaseMove=(event?:PointerEvent)=>{if(event&&event.pointerId!==moveId)return;moveId=undefined;scene.touch.x=scene.touch.y=0;knob.style.transform='translate(0px,0px)';stick.classList.remove('pressed')};
 const releaseFire=(event?:PointerEvent)=>{if(event&&event.pointerId!==fireId)return;fireId=undefined;scene.touch.fire=false;fire.classList.remove('pressed')};
 stick.onpointerdown=event=>{if(scene.state!=='playing'||moveId!==undefined)return;event.preventDefault();moveId=event.pointerId;stick.setPointerCapture(moveId);stick.classList.add('pressed');move(event)};
 stick.onpointermove=move;stick.onpointerup=stick.onpointercancel=stick.onlostpointercapture=releaseMove;
 fire.onpointerdown=event=>{if(scene.state!=='playing'||fireId!==undefined)return;event.preventDefault();fireId=event.pointerId;fire.setPointerCapture(fireId);scene.touch.fire=true;fire.classList.add('pressed')};
 fire.onpointerup=fire.onpointercancel=fire.onlostpointercapture=releaseFire;
 dash.onpointerdown=event=>{event.preventDefault();if(scene.state==='playing')scene.touch.dash=true};
 const reset=()=>{releaseMove();releaseFire();scene.touch.dash=false};
 window.addEventListener('blur',reset);window.addEventListener('resize',reset);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)reset()});
 for(const element of [stick,fire,dash])element.addEventListener('contextmenu',event=>event.preventDefault());
 return reset;
}
