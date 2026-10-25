import Phaser from 'phaser';

const TILE_SIZE=1024;

class TerrainGradient {
 constructor(readonly gradients:CanvasGradient[]){}
 addColorStop(offset:number,color:string){for(const gradient of this.gradients)gradient.addColorStop(offset,color)}
}

/** Paint in world coordinates, directly into bounded canvases (including on iOS).
 * Each context keeps its tile offset through save/restore, so paths and gradients
 * cross tile boundaries without changing the world generation or random stream.
 * Only the Canvas 2D operations used by the terrain generator are exposed here.
 */
export class TerrainPainter {
 private tiles:Phaser.Textures.CanvasTexture[]=[];
 private contexts:CanvasRenderingContext2D[]=[];
 constructor(scene:Phaser.Scene,width:number,height:number){
  for(let y=0;y<height;y+=TILE_SIZE)for(let x=0;x<width;x+=TILE_SIZE){
   const key=`terrain-${x}-${y}`,tile=scene.textures.createCanvas(key,TILE_SIZE,TILE_SIZE)!;
   tile.context.translate(-x,-y);
   this.tiles.push(tile);this.contexts.push(tile.context);
   scene.add.image(x*2,y*2,key).setOrigin(0).setScale(2).setDepth(-100);
  }
 }
 set fillStyle(value:string|TerrainGradient){this.contexts.forEach((c,i)=>c.fillStyle=value instanceof TerrainGradient?value.gradients[i]:value)}
 set strokeStyle(value:string){for(const c of this.contexts)c.strokeStyle=value}
 set lineWidth(value:number){for(const c of this.contexts)c.lineWidth=value}
 set lineJoin(value:CanvasLineJoin){for(const c of this.contexts)c.lineJoin=value}
 set lineCap(value:CanvasLineCap){for(const c of this.contexts)c.lineCap=value}
 beginPath(){for(const c of this.contexts)c.beginPath()}
 closePath(){for(const c of this.contexts)c.closePath()}
 moveTo(x:number,y:number){for(const c of this.contexts)c.moveTo(x,y)}
 lineTo(x:number,y:number){for(const c of this.contexts)c.lineTo(x,y)}
 arc(...args:Parameters<CanvasRenderingContext2D['arc']>){for(const c of this.contexts)c.arc(...args)}
 ellipse(...args:Parameters<CanvasRenderingContext2D['ellipse']>){for(const c of this.contexts)c.ellipse(...args)}
 fill(){for(const c of this.contexts)c.fill()}
 stroke(){for(const c of this.contexts)c.stroke()}
 clip(){for(const c of this.contexts)c.clip()}
 fillRect(x:number,y:number,width:number,height:number){for(const c of this.contexts)c.fillRect(x,y,width,height)}
 save(){for(const c of this.contexts)c.save()}
 restore(){for(const c of this.contexts)c.restore()}
 translate(x:number,y:number){for(const c of this.contexts)c.translate(x,y)}
 rotate(angle:number){for(const c of this.contexts)c.rotate(angle)}
 createRadialGradient(...args:Parameters<CanvasRenderingContext2D['createRadialGradient']>){return new TerrainGradient(this.contexts.map(c=>c.createRadialGradient(...args)))}
 refresh(){for(const tile of this.tiles)tile.refresh()}
}
