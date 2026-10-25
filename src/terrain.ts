import Phaser from 'phaser';

const TILE_SIZE=1024;

class TerrainGradient {
 constructor(readonly gradients:CanvasGradient[]){}
 addColorStop(offset:number,color:string){for(const gradient of this.gradients)gradient.addColorStop(offset,color)}
}
class TerrainPattern {
 constructor(readonly patterns:CanvasPattern[]){}
}

/** Paint in world coordinates, directly into bounded canvases (including on iOS).
 * Each context keeps its tile offset through save/restore, so paths and gradients
 * cross tile boundaries without changing the world generation or random stream.
 * Only the Canvas 2D operations used by the terrain generator are exposed here.
 */
export class TerrainPainter {
 private tiles:Phaser.Textures.CanvasTexture[]=[];
 private contexts:CanvasRenderingContext2D[]=[];
 private cols=0;
 constructor(scene:Phaser.Scene,width:number,height:number){
  this.cols=Math.ceil(width/TILE_SIZE);
  for(let y=0;y<height;y+=TILE_SIZE)for(let x=0;x<width;x+=TILE_SIZE){
   const key=`terrain-${x}-${y}`,tile=scene.textures.createCanvas(key,TILE_SIZE,TILE_SIZE)!;
   tile.context.imageSmoothingEnabled=false;
   tile.context.translate(-x,-y);
   this.tiles.push(tile);this.contexts.push(tile.context);
   // Exact integer scale keeps source pixels aligned across chunk boundaries.
   scene.add.image(x*2,y*2,key).setOrigin(0).setDisplaySize(TILE_SIZE*2,TILE_SIZE*2).setDepth(-100);
  }
 }
 set fillStyle(value:string|TerrainGradient|TerrainPattern){
  this.contexts.forEach((c,i)=>{
   c.fillStyle=value instanceof TerrainGradient?value.gradients[i]:value instanceof TerrainPattern?value.patterns[i]:value;
  })
 }
 /** World-anchored repeating pattern built from a loaded texture. */
 pattern(scene:Phaser.Scene,key:string){
  const source=scene.textures.get(key).getSourceImage() as CanvasImageSource;
  // Contexts already carry the chunk translation; patterns share world origin.
  const patterns=this.contexts.map(c=>c.createPattern(source,'repeat')!);
  return new TerrainPattern(patterns);
 }
 /** Blit only into the tiles the destination rect intersects. */
 drawImage(img:CanvasImageSource,sx:number,sy:number,sw:number,sh:number,dx:number,dy:number,dw:number,dh:number){
  const x0=Math.max(0,Math.floor(dx/TILE_SIZE)),x1=Math.min(this.cols-1,Math.floor((dx+dw-1)/TILE_SIZE)),y0=Math.max(0,Math.floor(dy/TILE_SIZE)),y1=Math.floor((dy+dh-1)/TILE_SIZE);
  for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++){const c=this.contexts[ty*this.cols+tx];if(c)c.drawImage(img,sx,sy,sw,sh,dx,dy,dw,dh)}
 }
 /** Whole-image blit, convenient for stamps. */
 stamp(img:CanvasImageSource,x:number,y:number){this.drawImage(img,0,0,(img as {width:number}).width,(img as {height:number}).height,x,y,(img as {width:number}).width,(img as {height:number}).height)}
 set strokeStyle(value:string|TerrainPattern){for(const [i,c] of this.contexts.entries())c.strokeStyle=value instanceof TerrainPattern?value.patterns[i]:value}
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
 clip(rule:CanvasFillRule='nonzero'){for(const c of this.contexts)c.clip(rule)}
 fillRect(x:number,y:number,width:number,height:number){for(const c of this.contexts)c.fillRect(x,y,width,height)}
 save(){for(const c of this.contexts)c.save()}
 restore(){for(const c of this.contexts)c.restore()}
 translate(x:number,y:number){for(const c of this.contexts)c.translate(x,y)}
 rotate(angle:number){for(const c of this.contexts)c.rotate(angle)}
 createRadialGradient(...args:Parameters<CanvasRenderingContext2D['createRadialGradient']>){return new TerrainGradient(this.contexts.map(c=>c.createRadialGradient(...args)))}
 refresh(){for(const tile of this.tiles)tile.refresh()}
}
