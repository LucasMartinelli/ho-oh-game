import orchestra from './orchestra-data.json';
const db=(value:number)=>10**(value/20);
export class AudioManager {
 ctx?:AudioContext;master?:GainNode;musicBus?:GainNode;sfxBus?:GainNode;ambienceBus?:GainNode;duckBus?:GainNode;musicFilter?:BiquadFilterNode;muted=false;
 private loading=false;private musicSources:AudioBufferSourceNode[]=[];private intensity?:GainNode;private musicStarted=0;private loadedRegion=-1;private musicGain?:GainNode;private outgoing:AudioBufferSourceNode[]=[];trackTitle="";musicReady=false;musicError=false;private active=false;private flameGain?:GainNode;private flameOn=false;private windFilter?:BiquadFilterNode;private windGain?:GainNode;private waterGain?:GainNode;private rumbleGain?:GainNode;private crackleGain?:GainNode;private nextAccent=0;private voices=0;private region=-1;private combat=false;private boss=false;private rest=false;private paused=false;
 init(){this.ensure();void this.ctx!.resume()}
 private ensure(){if(this.ctx)return;const ctx=this.ctx=new AudioContext();this.master=ctx.createGain();this.master.gain.value=this.muted?0:db(-5);const limiter=ctx.createDynamicsCompressor();limiter.threshold.value=-6;limiter.knee.value=6;limiter.ratio.value=12;limiter.attack.value=.003;limiter.release.value=.2;this.master.connect(limiter);limiter.connect(ctx.destination);
  this.musicBus=ctx.createGain();this.musicBus.gain.value=db(-2);this.duckBus=ctx.createGain();this.musicFilter=ctx.createBiquadFilter();this.musicFilter.type='lowpass';this.musicFilter.frequency.value=20000;this.musicBus.connect(this.musicFilter);this.musicFilter.connect(this.duckBus);this.duckBus.connect(this.master);this.sfxBus=ctx.createGain();this.sfxBus.gain.value=db(-3);this.sfxBus.connect(this.master);this.ambienceBus=ctx.createGain();this.ambienceBus.gain.value=db(-14);this.ambienceBus.connect(this.master);
  this.windFilter=ctx.createBiquadFilter();this.windFilter.type='lowpass';this.windFilter.frequency.value=350;this.windGain=ctx.createGain();this.windGain.gain.value=.2;const wind=this.noise();wind.connect(this.windFilter);this.windFilter.connect(this.windGain);this.windGain.connect(this.ambienceBus);wind.start();
  const waterFilter=ctx.createBiquadFilter();waterFilter.type='bandpass';waterFilter.frequency.value=520;waterFilter.Q.value=.7;this.waterGain=ctx.createGain();this.waterGain.gain.value=0;const water=this.noise();water.connect(waterFilter);waterFilter.connect(this.waterGain);this.waterGain.connect(this.ambienceBus);water.start();
  const rumbleFilter=ctx.createBiquadFilter();rumbleFilter.type='lowpass';rumbleFilter.frequency.value=95;this.rumbleGain=ctx.createGain();this.rumbleGain.gain.value=0;const rumble=this.noise();rumble.connect(rumbleFilter);rumbleFilter.connect(this.rumbleGain);this.rumbleGain.connect(this.ambienceBus);rumble.start();
  const crackleFilter=ctx.createBiquadFilter();crackleFilter.type='lowpass';crackleFilter.frequency.value=2400;this.crackleGain=ctx.createGain();this.crackleGain.gain.value=0;const crackle=this.crackle();crackle.connect(crackleFilter);crackleFilter.connect(this.crackleGain);this.crackleGain.connect(this.ambienceBus);crackle.start();
 }
 start(){this.ensure();void this.ctx!.resume();this.active=true;void this.loadOrchestra();this.pause(false)}
 private noise(){const ctx=this.ctx!,source=ctx.createBufferSource(),buffer=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate),data=buffer.getChannelData(0);let previous=0;for(let i=0;i<data.length;i++){previous=(previous+Math.random()*.12-.06)/1.015;data[i]=previous*2}source.buffer=buffer;source.loop=true;return source}
 private crackle(){const ctx=this.ctx!,source=ctx.createBufferSource(),len=Math.floor(ctx.sampleRate*1.7),buffer=ctx.createBuffer(1,len,ctx.sampleRate),data=buffer.getChannelData(0);let previous=0;for(let i=0;i<len;i++){previous=(previous+Math.random()*.05-.025)/1.008;data[i]=previous*1.3}for(let k=0;k<30;k++){const at=Math.floor(Math.random()*(len-1200)),l=200+Math.floor(Math.random()*1100),amp=.25+Math.random()*.75;for(let i=0;i<l;i++)data[at+i]+=amp*Math.exp(-i/(l*.16))*(Math.random()*.8-.4)}source.buffer=buffer;source.loop=true;return source}
 pause(value:boolean){this.paused=value;this.active=!value;if(value)this.setFlame(false);if(this.ctx){const at=this.ctx.currentTime;this.ambienceBus?.gain.setTargetAtTime(value?db(-26):db(-14),at,.25);this.musicBus?.gain.setTargetAtTime(value?db(-11):db(-2),at,.35);this.musicFilter?.frequency.setTargetAtTime(value?620:this.rest?2400:20000,at,.3)}this.applyIntensity()}
 private applyIntensity(){if(!this.ctx||!this.intensity)return;const at=this.ctx.currentTime,target=this.paused||this.rest?0:this.boss?1:this.combat?.7:0;if(this.paused){this.intensity.gain.cancelScheduledValues(at);this.intensity.gain.setTargetAtTime(target,at,.5);return}const beat=60/orchestra.regions[Math.max(0,this.loadedRegion)].bpm,when=Math.max(at,this.musicStarted+Math.ceil((at-this.musicStarted)/beat)*beat);this.intensity.gain.cancelScheduledValues(at);this.intensity.gain.setTargetAtTime(target,when,.55)}
 toggle(){this.muted=!this.muted;if(this.ctx&&this.master)this.master.gain.setTargetAtTime(this.muted?0:db(-5),this.ctx.currentTime,.05);return this.muted}
 setEnvironment(region:number,combat:boolean,boss:boolean,rest=false){if(this.region===region&&this.combat===combat&&this.boss===boss&&this.rest===rest)return;this.region=region;this.rest=rest;void this.loadOrchestra();this.combat=combat;this.boss=boss;if(this.ctx){const at=this.ctx.currentTime;this.windFilter?.frequency.setTargetAtTime(region===1?1400:region===2?220:480,at,1.2);this.windGain?.gain.setTargetAtTime(region===1?.65:region===3?.42:.25,at,1);this.waterGain?.gain.setTargetAtTime(region===1?.5:0,at,1.4);this.rumbleGain?.gain.setTargetAtTime(region===2?.7:0,at,1.6);if(!this.paused)this.musicFilter?.frequency.setTargetAtTime(rest?2400:20000,at,.8);this.applyIntensity()}}
 setCampfire(level:number){if(this.ctx&&this.crackleGain)this.crackleGain.gain.setTargetAtTime(level*.55,this.ctx.currentTime,.25)}
 tick(){if(!this.ctx||!this.active||this.paused)return;const now=this.ctx.currentTime;if(now<this.nextAccent)return;this.nextAccent=now+2.5+Math.random()*4.5;const pan=(Math.random()-.5)*1.4;
  if(this.region===0){const base=1900+Math.random()*900,n=2+Math.floor(Math.random()*2);for(let i=0;i<n;i++)this.tone(base*(1+.07*i),.06,'sine',.06,1.5,this.ambienceBus,now+i*.09,pan)}
  else if(this.region===1)this.tone(560+Math.random()*260,.16,'sine',.06,.5,this.ambienceBus,now,pan);
  else if(this.region===2)this.tone(110+Math.random()*70,.2,'triangle',.09,.35,this.ambienceBus,now,pan);
  else if(this.region===3)this.tone(1150+Math.random()*750,.55,'sine',.04,1.03,this.ambienceBus,now,pan)}
 private async loadOrchestra(){
  if(this.loading||!this.ctx||!this.musicBus)return;
  const region=Math.max(0,Math.min(3,this.region));if(this.loadedRegion===region)return;
  this.loading=true;
  try{
   const ctx=this.ctx,track=orchestra.regions[region];
   const decode=(data:string)=>ctx.decodeAudioData(Uint8Array.from(atob(data),c=>c.charCodeAt(0)).buffer);
   const buffers=await Promise.all([decode(track.exploration),decode(track.combat)]);
   if(region!==Math.max(0,this.region))return; // Ignore stale loading after a rapid border crossing.
   const at=ctx.currentTime+.06;
   for(const source of this.outgoing){try{source.stop()}catch{}source.disconnect()}
   this.outgoing=this.musicSources;this.musicSources=[];
   if(this.musicGain){const old=this.musicGain;old.gain.cancelScheduledValues(at);old.gain.setValueAtTime(old.gain.value,at);old.gain.linearRampToValueAtTime(0,at+1.5);for(const source of this.outgoing){source.stop(at+1.55);source.onended=()=>{source.disconnect();source.buffer=null;old.disconnect();this.outgoing=this.outgoing.filter(s=>s!==source)}}}
   this.musicGain=ctx.createGain();this.musicGain.gain.setValueAtTime(0,at);this.musicGain.gain.linearRampToValueAtTime(1,at+1.5);this.musicGain.connect(this.musicBus);
   this.intensity=ctx.createGain();this.intensity.gain.value=this.paused||this.rest?0:this.boss?1:this.combat?.7:0;this.intensity.connect(this.musicGain);
   buffers.forEach((buffer,i)=>{const source=ctx.createBufferSource();source.buffer=buffer;source.loop=true;source.loopEnd=Math.min(track.duration,buffer.duration);source.connect(i===0?this.musicGain!:this.intensity!);source.start(at);this.musicSources.push(source)});
   this.musicStarted=at;this.loadedRegion=region;this.trackTitle=track.title;this.musicReady=true;this.musicError=false;
  }catch(error){this.musicError=true;console.warn('Não foi possível carregar a trilha da região.',error)}
  finally{this.loading=false;if(!this.musicError&&this.loadedRegion!==Math.max(0,this.region))void this.loadOrchestra()}
 }

 setFlame(on:boolean){if(!this.ctx||!this.sfxBus)return;if(!this.flameGain){const source=this.noise(),filter=this.ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=950;this.flameGain=this.ctx.createGain();this.flameGain.gain.value=0;source.connect(filter);filter.connect(this.flameGain);this.flameGain.connect(this.sfxBus);source.start()}if(this.flameOn!==on){this.flameOn=on;this.flameGain.gain.setTargetAtTime(on?.4:0,this.ctx.currentTime,.08)}}
 private tone(freq:number,length:number,type:OscillatorType='sine',gain=.2,slide=1,bus:GainNode|undefined=this.sfxBus,at?:number,pan=0){if(!this.ctx||!bus||this.muted||this.voices>=32)return;this.voices++;const now=at??this.ctx.currentTime,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,now);o.frequency.exponentialRampToValueAtTime(Math.max(30,freq*slide),now+length);g.gain.setValueAtTime(.0001,now);g.gain.linearRampToValueAtTime(gain,now+.008);g.gain.exponentialRampToValueAtTime(.0001,now+length);o.connect(g);if(pan){const pn=this.ctx.createStereoPanner();pn.pan.value=pan;g.connect(pn);pn.connect(bus)}else g.connect(bus);o.start(now);o.stop(now+length+.01);o.onended=()=>{o.disconnect();g.disconnect();this.voices--}}
 private duck(){if(!this.ctx||!this.duckBus)return;const at=this.ctx.currentTime,g=this.duckBus.gain;g.cancelScheduledValues(at);g.setValueAtTime(g.value,at);g.linearRampToValueAtTime(db(-6),at+.035);g.linearRampToValueAtTime(1,at+.6)}
 play(kind:string,pan=0){if(!this.ctx)return;const variation=1+(Math.random()-.5)*.07,at0=this.ctx.currentTime,tone=(f:number,l:number,t:OscillatorType='sine',g=.2,s=1,off=0)=>this.tone(f,l,t,g,s,this.sfxBus,at0+off,pan);switch(kind){
  case 'warn-roots':case 'warn-spores':tone(95*variation,.3,'triangle',.3,.55);break;
  case 'warn-jet':case 'warn-fan':case 'warn-hydro':tone(480*variation,.3,'sine',.16,.75);tone(240,.22,'sine',.12,.6,.06);break;
  case 'warn-dash':case 'warn-trail':case 'warn-combo':tone(140*variation,.35,'sawtooth',.18,2.2);break;
  case 'warn-ring':case 'warn-sonic':tone(210*variation,.55,'sine',.2,1.8);break;
  case 'warn-gust':tone(440*variation,.25,'sine',.15,1.6);break;
  case 'shot-water':tone(540*variation,.12,'sine',.1,.5);break;
  case 'shot-leaf':tone(720*variation,.1,'triangle',.08,1.4);break;
  case 'shot-gust':tone(430*variation,.15,'sine',.09,1.9);break;
  case 'shot-firebolt':tone(250*variation,.12,'sawtooth',.09,2);break;
  case 'roots':tone(82*variation,.42,'triangle',.28,.5);tone(170,.18,'sawtooth',.08,.6,.03);break;
  case 'spores':tone(310*variation,.3,'sine',.09,.6);tone(230,.24,'sine',.07,.7,.05);break;
  case 'aeroblast':tone(430*variation,.28,'sine',.2,2.6);tone(860,.18,'sine',.1,.6);break;
  case 'hit':tone(125*variation,.08,'triangle',.15,.4);break;
  case 'thud':tone(150*variation,.09,'triangle',.1,.45);break;
  case 'alert':tone(680*variation,.12,'square',.07,1.6);break;
  case 'kill':tone(580*variation,.18,'sine',.2,1.5);break;
  case 'hurt':this.duck();tone(220,.25,'triangle',.45,.3);break;
  case 'dash':tone(310*variation,.2,'sine',.2,2);break;
  case 'nova':tone(80*variation,.45,'triangle',.3,.45);tone(165,.3,'sawtooth',.1,.55,.02);break;
  case 'cyclone':tone(230*variation,.5,'sine',.2,3);tone(460,.35,'sine',.1,2.2,.06);break;
  case 'heal':tone(660,.4,'sine',.23,1.5);break;
  case 'pickup':tone(880*variation,.08,'sine',.18,1.5);tone(1318,.11,'sine',.13,1.1,.05);break;
  case 'checkpoint':tone(330,.45,'triangle',.2,1);tone(495,.4,'sine',.13,1,.08);tone(660,.34,'sine',.09,1,.16);break;
  case 'beacon':tone(196,.6,'sine',.22,1.4);tone(392,.5,'sine',.12,1,.09);tone(784,.4,'sine',.08,1,.18);break;
  case 'skill':[523,659,784,1046].forEach((f,i)=>tone(f,.2,'triangle',.13,1,i*.05));break;
  case 'perfect':tone(720*variation,.15,'sine',.2,2.1);tone(1440,.1,'sine',.09,.8,.04);break;
  case 'travel':tone(300,.4,'sine',.14,2.4);tone(620,.28,'sine',.08,1.5,.05);break;
  case 'ui':tone(880,.045,'triangle',.07,.8);break;
  case 'ui-open':tone(540,.09,'sine',.07,1.45);break;
  case 'ui-close':tone(540,.09,'sine',.07,.68);break;
  case 'wave':case 'bosswin':this.duck();[392,494,587,784].forEach((f,i)=>tone(f,.5,'sine',.25,1,i*.11));break;
  case 'over':[392,330,262,131].forEach((f,i)=>tone(f,.5,'triangle',.23,1,i*.16));}}
}
