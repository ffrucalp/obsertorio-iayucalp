import {consultarNoticias,validarParametros,jsonRespuesta} from '../../lib/noticias.mjs';
export async function handler(event){try{const p=new URLSearchParams(event.queryStringParameters||{});return jsonRespuesta(await consultarNoticias(validarParametros(p),{forzar:p.get('forzar')==='1'}));}catch(e){return jsonRespuesta({ok:false,error:e.message},502);}}
