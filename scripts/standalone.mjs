import {readFile,writeFile} from 'node:fs/promises';
const html=await readFile('dist/index.html','utf8');
const jsPath=html.match(/<script[^>]+src="([^"]+)"[^>]*><\/script>/)[1];
const cssPath=html.match(/<link[^>]+href="([^"]+\.css)"[^>]*>/)[1];
const js=(await readFile('dist/'+jsPath.replace(/^\.\//,''),'utf8')).replace(/<\/script/gi,'<\\/script');
const css=await readFile('dist/'+cssPath.replace(/^\.\//,''),'utf8');
const result=html.replace(/<script[^>]+src="[^"]+"[^>]*><\/script>/,()=>'<script type="module">'+js+'</script>').replace(/<link[^>]+href="[^"]+\.css"[^>]*>/,()=>'<style>'+css+'</style>');
await writeFile('jogar.html',result);
console.log('Versão autocontida gerada: jogar.html');
