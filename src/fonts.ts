import pixelify from '@fontsource/pixelify-sans/files/pixelify-sans-latin-700-normal.woff2?inline';
import dotGothic from '@fontsource/dotgothic16/files/dotgothic16-latin-400-normal.woff2?inline';
import silkscreen from '@fontsource/silkscreen/files/silkscreen-latin-400-normal.woff2?inline';

/** Latin subsets embedded as data URLs, so the standalone HTML keeps its typography. */
const faces=[['Pixelify Sans',pixelify,'700'],['DotGothic16',dotGothic,'400'],['Silkscreen',silkscreen,'400']] as const;

export const fontsReady:Promise<void>=Promise.all(faces.map(async([family,source,weight])=>{
 const face=new FontFace(family,`url(${source}) format('woff2')`,{weight,display:'swap'});
 document.fonts.add(await face.load());
})).then(()=>{},()=>{});
