import { SECCIONES, TENDENCIAS, buscarFacultad, buscarCarrera } from './catalogo.mjs';
import { verificacionTematica } from './ia.mjs';
import { clasificarGeografia, correspondeASeccion } from './geografia.mjs';

// Fuentes abiertas consultadas desde el servidor, sin claves ni scraping de artículos.
const RSS_EDITORIALES = [
  {nombre:'LA NACION', url:'https://www.lanacion.com.ar/arc/outboundfeeds/rss/?outputType=xml'},
  {nombre:'Clarín Tecnología', url:'https://www.clarin.com/rss/tecnologia/'},
  {nombre:'Clarín Sociedad', url:'https://www.clarin.com/rss/sociedad/'},
  {nombre:'Infobae', url:'https://www.infobae.com/arc/outboundfeeds/rss/'}
];
const MEDIOS_PRIORITARIOS = ['lanacion.com.ar','clarin.com','infobae.com'];
const NOMBRES_MEDIOS={'lanacion.com.ar':'LA NACION','clarin.com':'Clarín','infobae.com':'Infobae','tn.com.ar':'TN','dental-tribune.com':'Dental Tribune'};
const AMPLIACIONES = {
  arquitectura:{es:['"diseño arquitectónico" OR "arquitectura y construcción" OR urbanismo OR BIM'],en:['"architectural design" OR "building design" OR "urban planning" OR BIM']},
  'tec-arq':{es:['"diseño arquitectónico" OR construcción OR urbanismo OR BIM'],en:['"architectural design" OR construction OR "urban planning"']},
  odontologia:{es:['odontología OR dental OR dentista OR "cepillo de dientes" OR "salud bucal"','"cepillo dental" OR "cepillo eléctrico" OR "higiene oral" OR "prótesis dental"'],en:['dentistry OR dental OR toothbrush OR "oral health"','"smart toothbrush" OR "dental cleaning" OR "dental imaging"']},
  protesis:{es:['"prótesis dental" OR dentadura OR implantología OR "impresión dental"'],en:['"dental implants" OR "dental prosthetics" OR dentures']},
  asistencia:{es:['"higiene dental" OR "cepillo de dientes" OR "salud bucal" OR "asistente dental"'],en:['"dental hygiene" OR toothbrush OR "dental assistants"']},
  nutricion:{es:['nutrición OR alimentación OR dieta OR obesidad OR alimentos'],en:['nutrition OR diet OR obesity OR food']},
  gobernanza:{es:['"gobernanza de datos" OR privacidad OR "protección de datos" OR "auditoría algorítmica"'],en:['"AI governance" OR "data governance" OR "data privacy" OR "AI audit"']},
  'tec-gobernanza':{es:['"gobernanza de datos" OR privacidad OR "protección de datos"'],en:['"AI governance" OR "data governance" OR "data privacy"']},
  psicologia:{es:['psicología OR "salud mental" OR psicoterapia OR "bienestar psicológico"'],en:['psychology OR "mental health" OR psychotherapy']},
  educacion:{es:['educación OR docentes OR alumnos OR universidad OR aula'],en:['education OR teacher OR learning OR classroom']},
  abogacia:{es:['justicia OR "ley de IA" OR abogado OR derecho OR jueces'],en:['law OR lawyers OR courts OR "AI regulation"']},
  ambiental:{es:['ambiental OR clima OR contaminación OR biodiversidad'],en:['environment OR climate OR pollution OR biodiversity']},
  sistemas:{es:['software OR programación OR ciberseguridad OR "agentes de IA"'],en:['software OR coding OR cybersecurity OR "AI agents"']}
};
const ENTIDADES={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' ',rsquo:'’',ldquo:'“',rdquo:'”',hellip:'…',mdash:'—',aacute:'á',eacute:'é',iacute:'í',oacute:'ó',uacute:'ú',ntilde:'ñ'};
export function descodificar(s=''){return String(s).replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi,(m,k)=>{const c=k.toLowerCase();if(c[0]==='#'){const n=c[1]==='x'?parseInt(c.slice(2),16):parseInt(c.slice(1),10);return Number.isFinite(n)&&n>0&&n<=0x10ffff&&!(n>=0xd800&&n<=0xdfff)?String.fromCodePoint(n):'';}return ENTIDADES[c]??m;});}
const textoXml=(x)=>descodificar(descodificar(String(x).replace(/^<!\[CDATA\[([\s\S]*?)\]\]>$/,'$1'))).replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
const tag=(s,t)=>s.match(new RegExp(`<${t}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${t}>`,'i'))?.[1]||'';
const urlValida=s=>{try{const u=new URL(descodificar(s));return ['https:','http:'].includes(u.protocol)?u.href:null;}catch{return null;}};
const idNormal=t=>String(t||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
function nombreMedio(url,defecto=''){try{const h=new URL(url).hostname.replace(/^www\./,'');return Object.entries(NOMBRES_MEDIOS).find(([domain])=>h===domain||h.endsWith('.'+domain))?.[1]||defecto||h;}catch{return defecto||'Medio no identificado';}}
export function parsearRSS(xml,{origen='RSS editorial',fuenteFallback=''}={}){
  if(typeof xml!=='string'||!/<rss\b/i.test(xml))throw new Error('Respuesta RSS no válida');
  return (xml.match(/<item\b[^>]*>[\s\S]*?<\/item>/gi)||[]).map(bl=>{
    const source=bl.match(/<source\b([^>]*)>([\s\S]*?)<\/source>/i);
    const src=textoXml(source?.[2]||'');const urlFuente=urlValida(source?.[1]?.match(/\burl\s*=\s*(["'])(.*?)\1/i)?.[2]||'');const url=urlValida(textoXml(tag(bl,'link')));
    const medio=src||nombreMedio(url,fuenteFallback);
    const t=textoXml(tag(bl,'title'));
    const titulo=t.endsWith(` - ${medio}`)?t.slice(0,-medio.length-3):t;
    if(!url||!titulo)return null;
    const res=textoXml(tag(bl,'description'));
    // De los RSS propios de editoriales mostramos solamente título y enlace (no republicamos bajadas).
    const resumen=origen==='RSS editorial'?'':res.length>titulo.length+35&&res.toLowerCase()!==titulo.toLowerCase()?res.slice(0,240):'';
    const p=Date.parse(textoXml(tag(bl,'pubDate')));
    return {id:textoXml(tag(bl,'guid'))||url,titulo,url,fuente:medio,urlFuente,fecha:Number.isFinite(p)?new Date(p).toISOString():null,resumen,origen};
  }).filter(Boolean);
}
export function parsearGDELT(payload){
  if(!payload||!Array.isArray(payload.articles))throw new Error('JSON GDELT no válido');
  return payload.articles.map(a=>{
    const url=urlValida(a.url),titulo=String(a.title||'').trim();if(!url||!titulo)return null;
    const raw=a.seendate||a.seenDate||a.date||'';
    const iso=/^(\d{4})(\d\d)(\d\d)T(\d\d)(\d\d)(\d\d)Z$/.test(raw)?raw.replace(/^(\d{4})(\d\d)(\d\d)T(\d\d)(\d\d)(\d\d)Z$/,'$1-$2-$3T$4:$5:$6Z'):raw;
    const dt=Date.parse(iso);
    return {id:url,titulo,url,fuente:nombreMedio(url,a.domain),paisFuente:String(a.sourcecountry||''),fecha:Number.isFinite(dt)?new Date(dt).toISOString():null,resumen:'',origen:'GDELT'};
  }).filter(Boolean);
}
export function validarParametros(sp){
  const seccion=Object.hasOwn(SECCIONES,sp.get('seccion'))?sp.get('seccion'):'argentina';
  const facultad=buscarFacultad(sp.get('facultad'))?.id||'';
  const carrera=buscarCarrera(buscarFacultad(facultad),sp.get('carrera'))?.id||'';
  const periodo=sp.get('periodo')==='desde2026'?'desde2026':([7,30,90,180,365].includes(Number(sp.get('periodo')))?Number(sp.get('periodo')):'desde2026');
  const q=String(sp.get('q')||'').replace(/[\r\n<>"(){}\[\]\\]/g,' ').replace(/\s+/g,' ').trim().slice(0,90);
  return {seccion,facultad,carrera,periodo,q};
}
const particionar=(arr,n)=>{const r=[];for(let i=0;i<arr.length;i+=n)r.push(arr.slice(i,i+n));return r;};
function temasPorCarrera(p){
  const f=buscarFacultad(p.facultad),c=buscarCarrera(f,p.carrera);
  if(c){const x=AMPLIACIONES[c.id]||{es:[],en:[]};return [{texto:c.es,idioma:'es'},{texto:c.en,idioma:'en'},...(x.es||[]).map(texto=>({texto,idioma:'es'})),...(x.en||[]).map(texto=>({texto,idioma:'en'}))].slice(0,6);}
  if(f){const carreras=particionar(f.carreras,Math.max(1,Math.ceil(f.carreras.length/3)));return carreras.slice(0,4).map(g=>({texto:g.map(x=>`(${x.es})`).join(' OR '),idioma:'es'}));}
  return TENDENCIAS[p.seccion].map(texto=>({texto,idioma:p.seccion==='internacional'?'en':'es'}));
}
const IA_ES='("inteligencia artificial" OR "IA" OR "aprendizaje automático" OR "visión artificial")';
const IA_EN='("artificial intelligence" OR "AI" OR "machine learning" OR "computer vision")';
function consultaLibre(p,idioma='es'){
  const carrera=buscarCarrera(buscarFacultad(p.facultad),p.carrera);
  const extras=AMPLIACIONES[carrera?.id]||{};
  if(p.q)return p.q;
  if(extras[idioma]?.length)return extras[idioma][0];
  if(carrera)return idioma==='en'?carrera.en:carrera.es;
  return idioma==='en'?'research OR technology OR universities':'tecnología OR innovación OR universidades';
}
// El modo histórico usa trimestres: evita que el límite aproximado de artículos por RSS
// oculte publicaciones antiguas dentro de una consulta demasiado amplia.
const ISO_DIA=d=>new Date(d).toISOString().slice(0,10);
export function ventanasHistoricas(hoy=new Date()){
  const inicio=new Date('2026-01-01T00:00:00.000Z');
  const fin=new Date(Date.UTC(hoy.getUTCFullYear(),hoy.getUTCMonth(),hoy.getUTCDate()+2));
  if(fin<=inicio)return [];
  const rangos=[];let cur=inicio;
  while(cur<fin&&rangos.length<40){
    const proximo=new Date(Date.UTC(cur.getUTCFullYear(),cur.getUTCMonth()+3,1));
    const hasta=proximo<fin?proximo:fin;
    rangos.push({desde:ISO_DIA(cur),hasta:ISO_DIA(hasta)});
    cur=hasta;
  }
  return rangos;
}
function intervalo(p,rango){
  if(rango)return `after:${ISO_DIA(new Date(Date.parse(rango.desde+'T00:00:00Z')-86400000))} before:${rango.hasta}`;
  return p.periodo==='desde2026'?'after:2025-12-31':`when:${p.periodo}d`;
}
function temasBreves(p){
  const c=buscarCarrera(buscarFacultad(p.facultad),p.carrera);
  const f=buscarFacultad(p.facultad);
  // La búsqueda directa del usuario manda, pero la consulta no añade todas las variantes OR.
  if(p.q){return [{q:`IA ${p.q}`,idioma:'es'},{q:`"inteligencia artificial" ${p.q}`,idioma:'es'},{q:`"AI" ${p.q}`,idioma:'en'},{q:`"machine learning" ${p.q}`,idioma:'en'}]}
  if(c?.id==='arquitectura'||c?.id==='tec-arq')return [
    {q:'"inteligencia artificial" "arquitectura" "construcción"',idioma:'es'},
    {q:'IA "diseño arquitectónico"',idioma:'es'},
    {q:'IA "edificios" BIM',idioma:'es'},
    {q:'"artificial intelligence" "architectural design"',idioma:'en'},
    {q:'AI "urban planning" buildings',idioma:'en'}
  ];
  if(c?.id==='odontologia')return [
    {q:'"inteligencia artificial" odontología',idioma:'es'},
    {q:'IA dental',idioma:'es'},
    {q:'IA "cepillo de dientes"',idioma:'es'},
    {q:'IA odontológicos',idioma:'es'},
    {q:'"artificial intelligence" dentistry',idioma:'en'},
    {q:'AI toothbrush',idioma:'en'}
  ];
  if(c){
    const parts=c.es.split(/\s+OR\s+/i).map(t=>t.replace(/[()]/g,'').trim()).filter(Boolean);
    const en=c.en.split(/\s+OR\s+/i).map(t=>t.replace(/[()]/g,'').trim()).filter(Boolean);
    return [
      {q:`"inteligencia artificial" ${parts[0]||c.nombre}`,idioma:'es'},
      {q:`IA ${parts[1]||parts[0]||c.nombre}`,idioma:'es'},
      {q:`IA ${parts[2]||parts[0]||c.nombre}`,idioma:'es'},
      {q:`"artificial intelligence" ${en[0]||c.nombre}`,idioma:'en'}
    ];
  }
  if(f){
    const carreras=f.carreras.map(x=>x.nombre.replace(/^(Licenciatura|Ciclo de Licenciatura|Técnico Universitario|Tecnicatura Universitaria|Profesorado Universitario) en /,'').replace(/^(Licenciatura|Profesorado) /,'')).filter(Boolean);
    return particionar(carreras,Math.max(2,Math.ceil(carreras.length/4))).map((g,i)=>({q:`${i===0?'"inteligencia artificial"':'IA'} (${g.join(' OR ')})`,idioma:'es'}));
  }
  return [
    {q:'"inteligencia artificial" Argentina',idioma:'es'},
    {q:'IA educación salud',idioma:'es'},
    {q:'"artificial intelligence" research',idioma:'en'}
  ];
}
export function construirConsultas(p){
  const rango=null;
  const extra=p.seccion==='universidades'?' universidad':'';
  return temasBreves(p).map(t=>[t.q,extra,intervalo(p,rango)].filter(Boolean).join(' ').replace(/\s+/g,' ').trim());
}
function pistaRegional(p){
  if(p.seccion==='argentina')return '(Argentina OR "Buenos Aires" OR "La Plata" OR "Mar del Plata")';
  if(p.seccion==='latinoamerica')return '(México OR Perú OR Chile OR Colombia OR Brasil OR Uruguay OR Ecuador OR Bolivia OR Paraguay)';
  return '';
}
function rssGoogle(t,p,rango,reforzarRegion=false){
  const locale=t.idioma==='en'&&p.seccion==='internacional'?{hl:'en-US',gl:'US',ceid:'US:en'}:SECCIONES[p.seccion];
  const u=new URL('https://news.google.com/rss/search');
  const q=[t.q,p.seccion==='universidades'?'universidad':'',reforzarRegion?pistaRegional(p):'',intervalo(p,rango)].filter(Boolean).join(' ');
  u.searchParams.set('q',q);u.searchParams.set('hl',locale.hl);u.searchParams.set('gl',locale.gl);u.searchParams.set('ceid',locale.ceid);
  return {nombre:'Google News',origen:'Google News',tipo:'rss',url:u.toString()};
}
export function planificarFuentes(p,hoy=new Date()){
  const temas=temasBreves(p);
  const historico=p.periodo==='desde2026';
  const rangos=historico?ventanasHistoricas(hoy):[null];
  let tareas=[];
  // Consultas cortas y ventanas trimestrales: evita OR anidados que a menudo no devuelven RSS.
  // En cada trimestre consultar diferentes expresiones de la disciplina; no solo un titular reciente.
  for(const rango of rangos){
    const elegidos=historico?temas.slice(0,p.carrera==='odontologia'?4:3):temas;
    for(const t of elegidos)tareas.push(rssGoogle(t,p,rango));
    // Consultas adicionales con topónimos: elevan la cobertura de noticias locales
    // sin eliminar las consultas generales que también detectan medios nacionales.
    if(pistaRegional(p))for(const t of elegidos.slice(0,2))tareas.push(rssGoogle(t,p,rango,true));
  }
  if(historico&&p.carrera==='odontologia'){
    for(const q of ['"artificial intelligence" dentistry','AI toothbrush'])tareas.push(rssGoogle({q,idioma:'en'},p, {desde:'2026-01-01',hasta:ISO_DIA(new Date(Date.UTC(hoy.getUTCFullYear(),hoy.getUTCMonth(),hoy.getUTCDate()+2)))}));
  }
  const tieneFiltros=!!(p.carrera||p.facultad||p.q);
  if(tieneFiltros&&['argentina','latinoamerica','universidades'].includes(p.seccion)){
    const foco=consultaLibre(p,'es');
    for(const dominio of MEDIOS_PRIORITARIOS){
      const u=new URL('https://news.google.com/rss/search');
      const query=`"inteligencia artificial" (${foco}) site:${dominio} ${historico?'after:2025-12-31':`when:${p.periodo}d`}`;
      u.searchParams.set('q',query);u.searchParams.set('hl','es-419');u.searchParams.set('gl','AR');u.searchParams.set('ceid','AR:es');
      tareas.push({nombre:'Medios nacionales',origen:'Google News',tipo:'rss',url:u.toString()});
    }
  }
  const idioma=p.seccion==='internacional'?'en':'es';
  const bingQ=`${idioma==='en'? '"artificial intelligence"':'"inteligencia artificial"'} (${consultaLibre(p,idioma)})`;
  const bing=new URL('https://www.bing.com/news/search');bing.searchParams.set('q',bingQ);bing.searchParams.set('format','rss');bing.searchParams.set('mkt',p.seccion==='internacional'?'en-US':'es-AR');
  tareas.push({nombre:'Bing News',origen:'Bing News',tipo:'rss',url:bing.toString()});
  for(const lang of (p.seccion==='internacional'?['en','es']:['es','en'])){
    const u=new URL('https://api.gdeltproject.org/api/v2/doc/doc');
    const tema=consultaLibre(p,lang),term=lang==='en'?'"artificial intelligence"':'"inteligencia artificial"';
    u.searchParams.set('query',`${term} (${tema})`.trim());u.searchParams.set('mode','artlist');u.searchParams.set('format','json');u.searchParams.set('maxrecords','75');u.searchParams.set('sort','datedesc');u.searchParams.set('timespan',`${Math.min(90,historico?90:p.periodo)}d`);
    tareas.push({nombre:'GDELT',origen:'GDELT',tipo:'gdelt',url:u.toString()});
  }
  if(['argentina','universidades','latinoamerica'].includes(p.seccion))for(const m of RSS_EDITORIALES)tareas.push({nombre:m.nombre,origen:'RSS editorial',tipo:'rss',url:m.url,fuenteFallback:m.nombre});
  return tareas;
}
export function enlacesExternos(p){
  const q=construirConsultas(p)[0];
  const srcQ=`${p.q||consultaLibre(p,'es')} "inteligencia artificial"`;
  const paginas=Object.fromEntries(MEDIOS_PRIORITARIOS.map(d=>[NOMBRES_MEDIOS[d],`https://www.google.com/search?q=${encodeURIComponent(srcQ+' site:'+d)}`]));
  return {google:`https://news.google.com/search?q=${encodeURIComponent([q,pistaRegional(p)].filter(Boolean).join(' '))}&hl=${encodeURIComponent(SECCIONES[p.seccion].hl)}`,paginas,ucalp:'https://www.ucalp.edu.ar/'};
}
async function obtener(t,fetchImpl){
  const r=await fetchImpl(t.url,{headers:{'User-Agent':'Mozilla/5.0 (compatible; ObservatorioUCALP/5.0; RSS reader)','Accept':t.tipo==='gdelt'?'application/json':'application/rss+xml,application/xml,text/xml'},signal:AbortSignal.timeout(8000)});
  if(!r.ok)throw Error(`${t.nombre}: HTTP ${r.status}`);
  const body=await r.text();if(body.length>3_000_000)throw Error('Respuesta excesiva');
  if(t.tipo==='gdelt')return parsearGDELT(JSON.parse(body));
  return parsearRSS(body,{origen:t.origen,fuenteFallback:t.fuenteFallback});
}
const memo=new Map(),TTL=4*60*1000;
export async function consultarNoticias(p,{fetchImpl=fetch,reloj=()=>Date.now(),forzar=false}={}){
  const key=JSON.stringify(p),cached=memo.get(key);
  if(!forzar&&cached&&(reloj()-cached.t)<TTL)return {...cached.res,cache:true};
  const tareas=planificarFuentes(p,new Date(reloj()));
  const respuestas=await Promise.allSettled(tareas.map(t=>obtener(t,fetchImpl)));
  const exitosas=respuestas.map((r,i)=>r.status==='fulfilled'?{t:tareas[i],datos:r.value}:null).filter(Boolean);
  if(!exitosas.length)throw Error('Ninguna fuente respondió. Revisá tu conexión o intentá nuevamente.');
  const limite=p.periodo==='desde2026'?Date.parse('2026-01-01T00:00:00Z'):reloj()-p.periodo*86400000;
  const f=buscarFacultad(p.facultad),c=buscarCarrera(f,p.carrera);
  const vistos=new Set();const stats={};const diagnostico={recibidas:0,fueraPeriodo:0,sinIA:0,sinDisciplina:0,sinTexto:0,fueraRegion:0,ubicacionIncierta:0,duplicadas:0};
  const items=exitosas.flatMap(({t,datos})=>{
    stats[t.origen]=(stats[t.origen]||0)+1;
    diagnostico.recibidas+=datos.length;return datos;
  }).filter(it=>{
    if(it.fecha && (Date.parse(it.fecha)<limite || Date.parse(it.fecha)>reloj()+2*86400000)){diagnostico.fueraPeriodo++;return false;}
    if(!verificacionTematica(it,null,null)){diagnostico.sinIA++;return false;}
    if(!verificacionTematica(it,f,c)){diagnostico.sinDisciplina++;return false;}
    if(p.q && !idNormal(`${it.titulo} ${it.resumen}`).includes(idNormal(p.q))){diagnostico.sinTexto++;return false;}
    if(p.seccion!=='universidades'){
      const geo=clasificarGeografia(it);
      if(!geo.region){diagnostico.ubicacionIncierta++;return false;}
      if(!correspondeASeccion(it,p.seccion)){diagnostico.fueraRegion++;return false;}
      it.pais=geo.pais;it.criterioPais=geo.criterio;
    }else{
      const geo=clasificarGeografia(it);it.pais=geo.pais;it.criterioPais=geo.criterio;
    }
    const clave=idNormal(it.titulo).replace(/\b(la nacion|clarin|infobae)\b$/,'').trim();
    if(vistos.has(clave)){diagnostico.duplicadas++;return false;}
    vistos.add(clave);
    return true;
  }).sort((a,b)=>Date.parse(b.fecha||0)-Date.parse(a.fecha||0)).slice(0,220);
  const fallos=respuestas.filter(r=>r.status==='rejected').length;
  const resultado={ok:true,fechaConsulta:new Date(reloj()).toISOString(),noticias:items,cantidad:items.length,consultas:tareas.length,respuestas:exitosas.length,
    fuentes:Object.entries(stats).map(([nombre,exitosas])=>({nombre,exitosas})),diagnostico,
    advertencia:fallos?`${fallos} de ${tareas.length} consultas no respondieron. Se muestran resultados de las fuentes disponibles.`:null,
    enlaces:enlacesExternos(p),nota:'Búsqueda multifuente por RSS, Bing y GDELT, con filtros de IA, disciplina y procedencia geográfica. La región se infiere del titular o, cuando no hay ubicación explícita, del medio o su dominio; puede haber omisiones y errores. Noticias sin ubicación suficiente no se incluyen en Argentina, Latinoamérica ni Internacional. Universidades es transversal. La clasificación no sustituye la verificación editorial.',cache:false};
  if(memo.size>60)memo.clear();memo.set(key,{t:reloj(),res:resultado});
  return resultado;
}
export function jsonRespuesta(res,status=200){return{statusCode:status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'public,max-age=120'},body:JSON.stringify(res)}};
