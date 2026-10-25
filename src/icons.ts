import {PALETTE as P} from './palette';

/** One character per palette colour. '.' is transparent; 'k' is reserved for the generated ink outline. */
const COLORS:Record<string,string>={
 k:P.ink950,n:P.ink800,i:P.ink600,j:P.ink400,
 w:P.paper50,p:P.paper200,s:P.paper300,q:P.paper400,m:P.paper600,
 e:P.ember200,o:P.ember400,r:P.ember500,R:P.ember600,D:P.ember700,
 l:P.gold100,y:P.gold300,Y:P.gold400,b:P.gold500,
 h:P.leaf300,g:P.leaf400,G:P.leaf600,
 u:P.tide200,t:P.tide300,T:P.tide500,
 v:P.gale300,V:P.gale500,
 z:'rgba(20,13,20,.42)'
};

/** Fill maps (max 14 × 14); the outline and centring on a 16 × 16 grid are generated. Light comes from the top left. */
const MAPS={
 flame:['....r......','...ror.....','...roor..r.','..rooor.rr.','..roYoorrr.','.roYYooorr.','.roYyYooor.','roYyyYYoorr','roYylyYYoor','roYyllyYoor','roYylllyYor','.roYllllYr.','..rrYyyrr..','...rrrrr...'],
 embers:['...r........','..ror.......','..rYr....r..','.roYor..ror.','.rYyYr..rYr.','..rrr..roYor','.......rYyYr','.r......rrr.','ror.........','rYr...r.....','.r...ror....','.....rYr....','......r.....'],
 reach:['..........rr..','.....rrrrooor.','rrrooooYYYyyor','oYYYyyyyllllyo','rrrooooYYYyyor','.....rrrrooor.','..........rr..'],
 burn:['....rrrr....','..rr....rr..','.r...ro...r.','.r..roor..r.','r..roYor...r','r..oYyYo...r','r.roYlyYo..r','r.oYllyYo..r','.r.oYYYo..r.','.r..rrr...r.','..rr....rr..','....rrrr....'],
 inferno:['.....yy.....','.y...yy...y.','..y.yyyy.y..','...yYooYy...','..yYorroYy..','yyyorrrroyyy','yyyorrrroyyy','..yYorroYy..','...yYooYy...','..y.yyyy.y..','.y...yy...y.','.....yy.....'],
 gust:['......ttt...','.....t...t..','.........t..','uuuuuuuuut..','uuuuuuuuu...','............','............','............','ttttttttttt.','tttttttttttt','..........t.','.......ttt..'],
 wing:['ww..........','wwww........','uwwwww......','.uuwwwwww...','.uuuuuuuuuu.','..vvvvvvvvvv','..vvvvvvvvv.','...VVVVVVVVV','...VVVVVVVV.','....VV.VV.VV'],
 cyclone:['vvvvvvvvvvvv','uuuuuuuuuuuu','.tttttttttt.','..uuuuuuuu..','..ttttttt...','...uuuuuu...','...ttttt....','....uuuu....','....ttt.....','.....uu.....','.....t......','......t.....'],
 talons:['.....w..w..w','.....w..w..w','....w..w..w.','....w..w..w.','...w..w..w..','...w..w..w..','..w..w..w...','..w..w..w...','.w..w..w....','.w..w..w....','w..w..w.....'],
 heart:['.rrr...rrr.','rowrr.rrrrr','rworrrrrrrR','rorrrrrrrRR','rrrrrrrrrRR','.rrrrrrrRR.','..rrrrrRR..','...rrrRR...','....rRR....','.....R.....'],
 warmth:['.yyy...yyy.','yllyy.yyyyY','ylyyywyyyYY','yyyyywyyyYY','yyywwwwwyYY','.yyyywyyYY.','..yyywyYY..','...yyyYY...','....yYY....','.....Y.....'],
 aegis:['bYYYYYYYYb','Yllllyyyyb','Ylyyyryyyb','Ylyyroryyb','Ylyroooryb','Ylyroyoryb','Ylyyrrryyb','.Ylyyyyyb.','.Ylyyyyyb.','..Ylyyyb..','...Yyyb...','....bb....'],
 rebirth:['...yyyy...','..y....y..','...yyyy...','....ro....','...roor...','...oYYo...','..roYlYr..','..oYllYo..','..roYYor..','...rrrr...','.jjjjjjjj.','jijjijjjij'],
 leaf:['.........gg.','.......gghg.','......ghhgg.','.....ghhgGg.','....ghhgGgG.','...ghhgGggG.','...ghgGgggG.','..ghgGgggG..','..ggGgggGG..','..gGgggGG...','..GgGGGG....','.bGGG.......','.b..........','b...........'],
 drop:['.....tt.....','.....tt.....','....tttt....','....uttt....','...uutttt...','..tuttttTt..','..uttttttT..','.tuttttttTt.','.utttttttTT.','.tttttttTTT.','.ttttttTTTT.','..ttttTTTT..','...TTTTTT...','.....TT.....'],
 feather:['....r....','...rrr...','..rrwrr..','..oowoo..','.oYYwYYo.','.YyywyyY.','.yyywyyy.','.gggwggg.','.hggwggG.','.tttwttT.','..ttwtT..','..VVwVV..','...VwV...','....q....'],
 map:['pppp....pppp','pggpsssspppp','pgggssttrprp','pggsstttprpp','ppgstttsrprp','pppsttsspppp','ppppsssspppp','pqppssssppqp','ppppssssqppp','ppppsssspppp','....ssss....'],
 scroll:['.bbbbbbbbbb.','byyyyyyyyyyb','.bbbbbbbbbb.','.pwwwwwwwwp.','.pwiiiiiwwp.','.pwwwwwwwwp.','.pwiiiiiiwp.','.pwwwwwwwwp.','.pwiiiwwwwp.','.pwwwwwwwwp.','.bbbbbbbbbb.','byyyyyyyyyyb','.bbbbbbbbbb.'],
 note:['...yyyyy','...yYYYy','...y...y','...y...y','...y...y','.yyy.yyy','yyyyyyyy','yyy.yyy.'],
 sound:['....pp......','...ppp...t..','ppppqp.t..t.','pwwpqp..t.t.','pwwpqp..t.t.','ppppqp.t..t.','...ppp...t..','....pp......'],
 mute:['....pp......','...ppp......','ppppqp.r..r.','pwwpqp..rr..','pwwpqp..rr..','ppppqp.r..r.','...ppp......','....pp......'],
 pause:['wpq...wpq','wpq...wpq','wpq...wpq','wpq...wpq','wpq...wpq','wpq...wpq','wpq...wpq','wpq...wpq','wpq...wpq','wpq...wpq'],
 play:['w......','wp.....','wpp....','wppp...','wpppp..','wppppp.','wppppqq','wppppq.','wpppq..','wppq...','wpq....','wq.....','q......'],
 fullscreen:['pppp....pppp','pppp....pppp','pp........pp','pp........pp','............','............','............','............','pp........pp','pp........pp','pppp....pppp','pppp....pppp'],
 exitFullscreen:['..pp....pp..','..pp....pp..','pppp....pppp','pppp....pppp','............','............','............','............','pppp....pppp','pppp....pppp','..pp....pp..','..pp....pp..'],
 close:['rr....rr','rrr..rrr','.rrrrrr.','..rrrr..','..rrrr..','.rrrrrr.','rrr..rrr','rr....rr'],
 next:['....w...','....ww..','wwwwwww.','wwwwwwww','wwwwwww.','....ww..','....w...'],
 pointer:['y....','yy...','lyy..','lyyy.','lyyyy','lyyy.','lyy..','yy...','y....'],
 checkOff:['wwwwwwwwww','wppppppppw','wppppppppw','wppppppppw','wppppppppw','wppppppppw','wppppppppw','wppppppppw','wppppppppw','wwwwwwwwww'],
 checkOn:['wwwwwwwwww','wppppppGpw','wpppppGGpw','wGppppGppw','wGGppGGppw','wpGGGGpppw','wppGGppppw','wppppppppw','wppppppppw','wwwwwwwwww'],
 radioOff:['..wwww..','.wppppw.','wppppppw','wppppppw','wppppppw','wppppppw','.wppppw.','..wwww..'],
 radioOn:['..wwww..','.wppppw.','wpyyyypw','wpylyypw','wpyyyYpw','wpyyYYpw','.wppppw.','..wwww..'],
 lock:['..jjjj..','.j....j.','.j....j.','yyyyyyyy','ylyyyyyb','ylykkyyb','ylykkyyb','yyyyyyyb','bbbbbbbb'],
 torii:['rr........rr','rrrrrrrrrrrr','.RRRRRRRRRR.','..rr....rr..','rrrrrrrrrrrr','..rr....rr..','..rr....rr..','..rr....rr..','..rr....rr..','..rr....rr..','.iiii..iiii.'],
 respawn:['....yyyy....','..yyyyyyyy..','.yyy....yyy.','.yy......y..','yy.....yyyyy','yy......yyy.','yy.......y..','yy..........','.YY......YY.','.YYY....YYY.','..YYYYYYYY..','....YYYY....'],
 sparkle:['....l....','....l....','...lyl...','...lyl...','llyywyyll','...lyl...','...lyl...','....l....','....l....'],
 seal:['...bbbb...','.bbYYYYbb.','.bYyyyyYb.','bYyyywyyYb','bYyywwwyYb','bYywwwwwYb','bYyywwwyYb','bYyywywyYb','.bYyyyyYb.','.bbYYYYbb.','...bbbb...'],
 tent:['.....b.....','.....o.....','....oor....','...ooorr...','..oookrrr..','..ookkkrr..','.oookkkrrr.','oooookkrrrr','bbbbbbbbbbb'],
 lantern:['...bb...','.bbbbbb.','.roooor.','royyyyor','rRrrrrRr','royllyor','rRrrrrRr','royyyyor','.roooor.','.bbbbbb.','...bb...'],
 you:['...y...','..yly..','.ylwly.','ylwwwly','.ylwly.','..yly..','...y...']
} as const;

export type IconName=keyof typeof MAPS|'lugia';
type Grid=string[][];

const recolor=(rows:readonly string[],swap:Record<string,string>)=>rows.map(row=>[...row].map(c=>swap[c]??c).join(''));
const SOURCE:Record<IconName,readonly string[]>={...MAPS,lugia:recolor(MAPS.feather,{r:'T',o:'T',Y:'t',y:'u',g:'w',h:'w',t:'u',T:'t',V:'T'})};

function place(rows:readonly string[],w:number,h:number):Grid{
 const grid:Grid=Array.from({length:h},()=>Array(w).fill('')),rw=Math.max(...rows.map(r=>r.length));
 const ox=Math.floor((w-rw)/2),oy=Math.floor((h-rows.length)/2);
 rows.forEach((row,y)=>[...row].forEach((c,x)=>{if(c!=='.')grid[y+oy][x+ox]=c}));
 return grid;
}
/** Adds a 1-pixel ink outline around filled cells (orthogonal neighbours, or all eight). */
function outline(grid:Grid,color='k',diagonal=false):Grid{
 const h=grid.length,w=grid[0].length,out=grid.map(r=>[...r]);
 const near=diagonal?[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]:[[1,0],[-1,0],[0,1],[0,-1]];
 for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(!grid[y][x]&&near.some(([dx,dy])=>grid[y+dy]?.[x+dx]))out[y][x]=color;
 return out;
}
/** Merges horizontal runs per colour into one path each. */
function toSvg(grid:Grid,attrs:string){
 const runs:Record<string,string>={};
 grid.forEach((row,y)=>{for(let x=0;x<row.length;){const c=row[x];let n=1;while(row[x+n]===c)n++;if(c)runs[c]=(runs[c]??'')+`M${x} ${y}h${n}v1h-${n}z`;x+=n}});
 const paths=Object.entries(runs).map(([c,d])=>`<path fill="${COLORS[c]}" d="${d}"/>`).join('');
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${grid[0].length} ${grid.length}" shape-rendering="crispEdges" ${attrs}>${paths}</svg>`;
}
const uri=(svg:string)=>`url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

const grids=new Map<IconName,Grid>();
function iconGrid(name:IconName){let g=grids.get(name);if(!g){g=outline(place(SOURCE[name],16,16));grids.set(name,g)}return g}

/** Inline, decorative pixel icon. Size it in CSS with multiples of 16 px. */
export const icon=(name:IconName,cls='')=>toSvg(iconGrid(name),`class="px-icon px-icon--${name}${cls?' '+cls:''}" width="16" height="16" aria-hidden="true" focusable="false"`);

/** Draws an icon on a 2D canvas, centred on x/y, at an integer scale. */
export function drawIcon(c:CanvasRenderingContext2D,name:IconName,x:number,y:number,scale:number){
 const g=iconGrid(name),s=Math.max(1,Math.round(scale)),ox=Math.round(x-8*s),oy=Math.round(y-8*s);
 g.forEach((row,j)=>row.forEach((col,i)=>{if(col){c.fillStyle=COLORS[col];c.fillRect(ox+i*s,oy+j*s,s,s)}}));
}

const LETTERS:Record<string,string[]>={
 H:['XX..XX','XX..XX','XX..XX','XX..XX','XXXXXX','XXXXXX','XX..XX','XX..XX','XX..XX','XX..XX','XX..XX'],
 O:['.XXXX.','XXXXXX','XX..XX','XX..XX','XX..XX','XX..XX','XX..XX','XX..XX','XX..XX','XXXXXX','.XXXX.'],
 '-':['....','....','....','....','XXXX','XXXX','....','....','....','....','....']
};
/** "HO-OH" in pixel letters: gold bands, ember outline, ember extrusion and an ink edge. */
export function logo(){
 const word='HO-OH',rows=Array.from({length:11},(_,y)=>[...word].map(ch=>LETTERS[ch][y]).join('..'));
 const band=(y:number)=>y<3?'l':y<7?'y':'Y',w=rows[0].length+4,h=rows.length+6;
 let g=place(rows.map((r,y)=>r.replace(/X/g,band(y))),w,h-2);g.push(Array(w).fill(''),Array(w).fill(''));
 g=outline(g,'R',true);
 const solid=g.map(r=>r.map(Boolean));
 for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(!solid[y][x]&&(solid[y-1]?.[x]||solid[y-2]?.[x]))g[y][x]='D';
 g=outline(g);
 return toSvg(g,`class="logo-svg" width="${w}" height="${h}" aria-hidden="true" focusable="false"`);
}

/** Pixel disc with ring, top-left light and bottom-right shade. */
function disc(size:number,fill:string,light:string,shade:string,ring:string,ringWidth=2,hollow=false){
 const g:Grid=Array.from({length:size},()=>Array(size).fill('')),c=size/2,r=c-1;
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const dx=x+.5-c,dy=y+.5-c,d=Math.hypot(dx,dy);if(d>r)continue;
  if(d>r-ringWidth){g[y][x]=ring;continue}
  if(hollow){g[y][x]=fill;continue}
  if(Math.hypot(dx+r*.28,dy+r*.28)>r-ringWidth)g[y][x]=shade;
  else if(Math.hypot(dx+r*.42,dy+r*.42)<r*.24)g[y][x]=light;
  else g[y][x]=fill;
 }
 return outline(g);
}

/** CSS custom properties for art used from stylesheets (pointers, form controls, discs). */
export function installArt(root=document.documentElement){
 const art:Record<string,string>={
  '--icon-pointer':uri(icon('pointer')),'--icon-sparkle':uri(icon('sparkle')),'--icon-lock':uri(icon('lock')),
  '--icon-check-off':uri(icon('checkOff')),'--icon-check-on':uri(icon('checkOn')),'--icon-radio-off':uri(icon('radioOff')),'--icon-radio-on':uri(icon('radioOn')),
  '--icon-scroll':uri(icon('scroll')),'--icon-note':uri(icon('note')),'--icon-next':uri(icon('next')),
  '--art-sun':uri(toSvg(disc(64,'r','o','R','y',3),'')),
  '--art-fire':uri(toSvg(disc(42,'r','e','R','o',2),'')),
  '--art-dash':uri(toSvg(disc(28,'n','i','k','b',2),'')),
  '--art-knob':uri(toSvg(disc(24,'p','w','q','w',1),'')),
  '--art-stick':uri(toSvg(disc(56,'z','z','z','n',3,true),''))
 };
 for(const [k,v] of Object.entries(art))root.style.setProperty(k,v);
}

/** Development contact sheet (open the dev server with ?icons). */
export function iconSheet(){
 const names=Object.keys(SOURCE) as IconName[];
 const row=(bg:string)=>`<div style="display:flex;flex-wrap:wrap;gap:12px;padding:16px;background:${bg}">${names.map(n=>`<figure style="margin:0;text-align:center;font:10px monospace;color:${bg===P.paper100?P.ink900:P.paper100}">${[16,32,48].map(s=>icon(n).replace('width="16" height="16"',`width="${s}" height="${s}"`)).join(' ')}<figcaption>${n}</figcaption></figure>`).join('')}</div>`;
 const big=logo().replace(/width="(\d+)" height="(\d+)"/,(_,w,h)=>`width="${w*5}" height="${h*5}"`);
 const discs=['sun','fire','dash','knob','stick'].map(n=>`<i style="display:inline-block;width:${n==='sun'?128:n==='stick'?112:n==='fire'?84:n==='dash'?56:48}px;aspect-ratio:1;background:var(--art-${n}) center/contain no-repeat;image-rendering:pixelated"></i>`).join('');
 return `<div style="position:fixed;inset:0;z-index:99;overflow:auto;background:${P.ink950}">${row(P.paper100)}${row(P.ink900)}<div style="padding:16px;display:flex;flex-wrap:wrap;gap:24px;align-items:center;background:${P.ink900}">${big}${discs}</div><div style="padding:16px;background:${P.paper100}">${big}</div></div>`;
}
