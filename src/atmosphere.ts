import Phaser from 'phaser';
import type {World} from './world';
import type {Player} from './actors';
import {seeded} from './scenery';
const fragment=`precision mediump float;
uniform sampler2D uMainSampler;
uniform vec3 uTint;
uniform vec3 uFogColor;
uniform vec2 uScroll;
uniform vec2 uHero;
uniform float uTime;
uniform float uDensity;
varying vec2 outTexCoord;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.)),f.x),f.y);}
float clouds(vec2 p){return noise(p)*.57+noise(p*2.03+8.1)*.28+noise(p*4.07-3.7)*.15;}
void main(){vec2 uv=outTexCoord;vec4 c=texture2D(uMainSampler,uv);vec2 p=uv-.5;float edge=smoothstep(.25,.73,length(p));vec3 rgb=c.rgb*uTint*(1.-edge*.22);
 vec2 world=vec2(uv.x*1.75,uv.y)+uScroll;float broad=clouds(world*3.2+vec2(uTime*.028,uTime*.009));float wisps=clouds(world*vec2(6.,3.)-vec2(uTime*.042,uTime*.018));
 float clearHero=smoothstep(.07,.32,length((uv-uHero)*vec2(1.75,1.)));
 float fog=smoothstep(.22,.78,broad*.7+wisps*.3)*uDensity*(.3+clearHero*.7);
 rgb=mix(rgb,uFogColor,fog);gl_FragColor=vec4(rgb,c.a);}`;
export class AtmospherePipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
 tint=[1.04,1.015,.965];fogColor=[.66,.75,.70];scroll=[0,0];hero=[.5,.5];time=0;density=.5;
 constructor(game:Phaser.Game){super({game,renderTarget:true,fragShader:fragment})}
 onPreRender(){this.set3f('uTint',...this.tint as [number,number,number]);this.set3f('uFogColor',...this.fogColor as [number,number,number]);this.set2f('uScroll',this.scroll[0],this.scroll[1]);this.set2f('uHero',this.hero[0],this.hero[1]);this.set1f('uTime',this.time);this.set1f('uDensity',this.density)}
}
export class Atmosphere {
 water:Phaser.GameObjects.Graphics;air:Phaser.GameObjects.Graphics;light:Phaser.GameObjects.Graphics;aura:Phaser.GameObjects.Image;
 private pipeline?:AtmospherePipeline;private weatherMix=[1,0,0,0];private weatherTime=0;private motes:{x:number;y:number;phase:number;speed:number;size:number}[]=[];private feathers:{s:Phaser.GameObjects.Image;life:number;max:number;vx:number;vy:number}[]=[];private trailTimer=0;private bank=0;
 constructor(private scene:Phaser.Scene,private world:World){
  this.water=scene.add.graphics().setDepth(-15);this.air=scene.add.graphics().setDepth(9200).setScrollFactor(0);this.light=scene.add.graphics().setDepth(8800).setScrollFactor(0).setBlendMode(Phaser.BlendModes.ADD);this.aura=scene.add.image(0,0,'glow').setBlendMode(Phaser.BlendModes.ADD).setScale(2.7).setAlpha(.12);
  const rnd=seeded(250442);for(let i=0;i<65;i++)this.motes.push({x:rnd()*1120,y:rnd()*640,phase:rnd()*6.28,speed:7+rnd()*18,size:.6+rnd()*1.4});
  if(scene.game.renderer instanceof Phaser.Renderer.WebGL.WebGLRenderer){scene.game.renderer.pipelines.addPostPipeline('JohtoAtmosphere',AtmospherePipeline);scene.cameras.main.setPostPipeline('JohtoAtmosphere');this.pipeline=scene.cameras.main.getPostPipeline('JohtoAtmosphere') as AtmospherePipeline}
 }
 update(t:number,dt:number,p:Player,mx=0,my=0,region=0,reduced=false){
  const cam=this.scene.cameras.main,near=(x:number,y:number,r=180)=>x>cam.scrollX-r&&y>cam.scrollY-r&&x<cam.scrollX+cam.width/cam.zoom+r&&y<cam.scrollY+cam.height/cam.zoom+r;
  for(const tree of this.world.trees){const visible=near(tree.x,tree.y);tree.sprite.setVisible(visible);if(!visible)continue;tree.sprite.setAngle(reduced?0:(Math.sin(t*.8+tree.phase)+Math.sin(t*.27)*.6)*1.1).setScale(1.25,1.25+(reduced?0:Math.sin(t*.8+tree.phase)*.007));const overlap=p.y<tree.y+45&&p.y>tree.y-165&&Math.abs(p.x-tree.x)<85;tree.sprite.setAlpha(tree.sprite.alpha+((overlap?.28:1)-tree.sprite.alpha)*(1-Math.exp(-dt*10)))}
  this.water.clear();for(const [x,y,r] of this.world.ponds){if(!near(x,y,r))continue;for(let i=0;i<16;i++){const yy=Math.sin(i*2.399)*r*.83,xx=Math.cos(i*2.399)*r*.65,max=Math.sqrt(Math.max(0,(r-10)**2-yy**2)),wave=reduced?0:Math.sin(t*.9+i)*9;const from=Math.max(-max,xx-12+wave),to=Math.min(max,xx+16+wave);this.water.lineStyle(i%3?1:2,0xc5e6ce,.13+Math.sin(t+i)*.04).lineBetween(x+from,y+yy,x+to,y+yy)}for(let i=0;i<3;i++){const radius=12+((reduced?i*11:t*9+i*23)%38);this.water.lineStyle(1,0xbeddd2,(1-radius/55)*.18).strokeEllipse(x-r*.28+i*12,y+r*.17,radius*2,radius*.65)}}
  this.air.setScale(cam.width/1120,cam.height/640);this.light.setScale(cam.width/1120,cam.height/640);this.air.clear();this.light.clear();if(!reduced){
   for(const m of this.motes){const x=((m.x+t*m.speed-cam.scrollX*.25)%1120+1120)%1120,y=((m.y+Math.sin(t*.5+m.phase)*20-cam.scrollY*.25)%640+640)%640;const leaf=m.phase<1.4;this.air.fillStyle(region===2?0xf3b574:leaf?0xc6ca86:0xffedb2,leaf?.22:.15+.14*Math.sin(t+m.phase)**2);if(leaf)this.air.fillTriangle(x,y,x+5,y+Math.sin(t+m.phase)*4,x+1,y+3);else this.air.fillCircle(x,y,m.size)}
   for(let i=0;i<4;i++){const x=100+i*340+Math.sin(t*.08+i)*35;this.light.fillStyle(region===3?0xb7d0d5:0xffdfa2,.018);this.light.fillTriangle(x-70,-40,x+90,-40,x+360,640);this.light.fillStyle(0xffe5b5,.012).fillTriangle(x+90,-40,x+360,640,x+430,640)}
  }
  this.weatherTime+=dt*(reduced?.12:1);
  for(let i=0;i<4;i++)this.weatherMix[i]+=((region===i?1:0)-this.weatherMix[i])*(1-Math.exp(-dt*.7));
  const rain=this.weatherMix[1]+this.weatherMix[3]*.6,ash=this.weatherMix[2];
  if(!reduced){
   for(let i=0;i<135;i++){const m=this.motes[i%65],x=((m.x+i*83-t*(85+i%19)-cam.scrollX*.15)%1160+1160)%1160-20,y=((m.y+t*(390+i%37*8)-cam.scrollY*.15)%700+700)%700-30;
    if(rain>.02){this.air.lineStyle(i%4===0?1.5:1,0xc4dce8,rain*(.14+(i%3)*.06)).lineBetween(x,y,x-7,y+18+i%12);if(i<22){const ripple=(t*1.3+m.phase)%1;this.air.lineStyle(1,0xb5d9df,rain*(1-ripple)*.13).strokeEllipse(m.x,m.y,5+ripple*20,2+ripple*7)}}
    if(ash>.02&&i<60){const xx=((m.x+t*(20+i%7))%1120+1120)%1120,yy=((m.y-t*(12+i%9))%640+640)%640;this.air.fillStyle(i%6===0?0xffad5b:0xcbb9a4,ash*(i%6===0?.65:.38)).fillRect(xx,yy,1.5,2.5)}
   }
  }
  if(this.pipeline){const palette=region===2?[1.08,.97,.88]:region===3?[.88,.96,1.07]:region===1?[.9,1.0,1.055]:[1.025,1.035,.96];const colors=region===2?[.57,.43,.34]:region===3?[.57,.65,.76]:region===1?[.64,.75,.79]:[.67,.76,.68];for(let i=0;i<3;i++){this.pipeline.tint[i]+=(palette[i]-this.pipeline.tint[i])*(1-Math.exp(-dt*.8));this.pipeline.fogColor[i]+=(colors[i]-this.pipeline.fogColor[i])*(1-Math.exp(-dt*.7))}const target=reduced?.2:region===3?.82:region===1?.7:region===2?.58:.55;this.pipeline.density+=(target-this.pipeline.density)*(1-Math.exp(-dt*.7));this.pipeline.time=this.weatherTime;this.pipeline.scroll=[cam.scrollX/640*.45,cam.scrollY/640*.45];this.pipeline.hero=[(p.x-cam.scrollX)*cam.zoom/cam.width,1-(p.y-cam.scrollY)*cam.zoom/cam.height]}
  const moving=Math.hypot(mx,my)>0,altitude=Math.sin(t*4.5)*3;
  this.aura.setPosition(p.x,p.y+7).setDepth(p.y-2).setAlpha(p.hp>0?.07+(p.heat/100)*.055:0);
  this.bank+=((moving?mx*.065:0)-this.bank)*(1-Math.exp(-dt*8));if(p.hp>0){p.sprite.setRotation(reduced?0:this.bank).setScale(p.scale*(p.dashTime>0?1.06:1),p.scale*(p.dashTime>0?.95:1));p.shadow.setScale(1-altitude*.015,.85-altitude*.01).setAlpha(.22)}
  this.trailTimer-=dt;if(!reduced&&p.hp>0&&this.trailTimer<=0&&(p.dashTime>0||moving)){this.trailTimer=p.dashTime>0?.035:.28;if(this.feathers.length<28){const s=this.scene.add.image(p.x-p.dx*25,p.y-p.dy*20+10,'gold-feather').setScale(p.dashTime>0?.45:.28).setAlpha(.6).setDepth(p.y-3).setAngle(t*45);const life=p.dashTime>0?.6:.9;this.feathers.push({s,life,max:life,vx:-p.dx*25,vy:18-p.dy*15})}}
  for(let i=this.feathers.length-1;i>=0;i--){const f=this.feathers[i];f.life-=dt;f.s.x+=f.vx*dt;f.s.y+=f.vy*dt;f.s.angle+=dt*80;f.s.setAlpha(Math.max(0,f.life/f.max*.5));if(f.life<=0){f.s.destroy();this.feathers.splice(i,1)}}
 }
 clear(){for(const f of this.feathers)f.s.destroy();this.feathers=[];this.bank=0}
}
