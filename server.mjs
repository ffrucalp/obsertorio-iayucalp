import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,resolve,extname,sep} from 'node:path';
import {consultarNoticias,validarParametros} from './lib/noticias.mjs';
const dir=dirname(fileURLToPath(import.meta.url));
const port=Number(process.env.PORT||4173);
const tipos={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.json':'application/json; charset=utf-8'};
createServer(async(req,res)=>{
 let url;
 try{url=new URL(req.url,`http://localhost:${port}`);}catch{res.writeHead(400);res.end();return;}
 if(url.pathname==='/api/noticias'){
   res.setHeader('Content-Type','application/json; charset=utf-8');
   try {const r=await consultarNoticias(validarParametros(url.searchParams),{forzar:url.searchParams.get('forzar')==='1'});res.writeHead(200);res.end(JSON.stringify(r));}
   catch(e){res.writeHead(502);res.end(JSON.stringify({ok:false,error:e.message}));}
   return;
 }
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
 let ruta;
 try{ruta=resolve(dir,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));}catch{res.writeHead(400);res.end();return;}
 if(!ruta.startsWith(dir+sep)||/(^|[\\/])(?:\.|lib|netlify|test)(?:[\\/]|$)/.test(ruta.slice(dir.length))||/\.(?:bat|toml|md)$/.test(ruta)) {res.writeHead(403);res.end();return;}
 try{const s=await stat(ruta);if(!s.isFile())throw Error();const content=await readFile(ruta);res.setHeader('Content-Type',tipos[extname(ruta)]||'application/octet-stream');res.writeHead(200);res.end(req.method==='HEAD'?undefined:content);}catch{res.writeHead(404);res.end('Archivo no encontrado');}
}).listen(port,'127.0.0.1',()=>{console.log('Monitor de Noticias UCALP listo en http://localhost:'+port);});
