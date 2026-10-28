import test from 'node:test';
import assert from 'node:assert/strict';
import { FACULTADES, SECCIONES } from '../lib/catalogo.mjs';
import { validarParametros, construirConsultas, parsearRSS, parsearGDELT, planificarFuentes, ventanasHistoricas, consultarNoticias } from '../lib/noticias.mjs';
import {esNoticiaIA,esNoticiaDeDisciplina} from '../lib/ia.mjs';
import {clasificarGeografia,correspondeASeccion} from '../lib/geografia.mjs';
const item=(titulo,url,fecha='Mon, 26 Oct 2026 10:00:00 GMT')=>`<item><title>${titulo} - Medio</title><link>${url}</link><guid>${url}</guid><pubDate>${fecha}</pubDate><source url="https://example.org">Medio</source><description>Actualidad sobre el asunto.</description></item>`;
const feed=(...items)=>`<?xml version="1.0"?><rss version="2.0"><channel>${items.join('')}</channel></rss>`;
test('7 facultades oficiales; carreras únicas y datos identificables',()=>{
 assert.equal(FACULTADES.length,7);
 assert.equal(new Set(FACULTADES.map(x=>x.id)).size,7);
 for(const f of FACULTADES){assert.ok(f.carreras.length>0);assert.equal(new Set(f.carreras.map(c=>c.id)).size,f.carreras.length);assert.ok(f.url.includes('ucalp.edu.ar'))}
});
test('cuatro secciones y combinaciones válidas',()=>{
 assert.deepEqual(Object.keys(SECCIONES),['argentina','latinoamerica','internacional','universidades']);
 const p=validarParametros(new URLSearchParams('seccion=universidades&facultad=exactas&carrera=gobernanza&periodo=90'));
 assert.equal(p.seccion,'universidades');assert.equal(p.carrera,'gobernanza');
 assert.ok(construirConsultas(p).every(q=>q.includes('universidad')&&q.includes('when:90d')));
});
test('no permite carrera que no corresponda a facultad',()=>{
 const p=validarParametros(new URLSearchParams('facultad=odontologia&carrera=gobernanza'));
 assert.equal(p.carrera,'');
});
test('búsquedas por facultad incluyen distintas carreras, no solo una',()=>{
 const p=validarParametros(new URLSearchParams('seccion=argentina&facultad=humanidades'));
 const qs=construirConsultas(p).join(' ');
 assert.match(qs,/psicolog/i);assert.match(qs,/filosof/i);assert.match(qs,/periodismo/i);
});
test('filtra entradas no válidas y decodifica títulos HTML',()=>{
 const datos=parsearRSS(feed(item('Innovación &amp; datos','https://example.com/a'),item('Peligro','javascript:alert(1)')));
 assert.equal(datos.length,1);assert.equal(datos[0].titulo,'Innovación & datos');
});
test('consulta RSS y deduplica',async()=>{
 const p=validarParametros(new URLSearchParams('seccion=internacional&facultad=odontologia&carrera=odontologia'));
 const fake=async()=>({ok:true,text:async()=>feed(item('AI transforms dental research at Oxford University','https://example.co.uk/a'))});
 const res=await consultarNoticias(p,{fetchImpl:fake,reloj:()=>Date.parse('2026-10-28T12:00:00Z'),forzar:true});
 assert.equal(res.ok,true);assert.equal(res.noticias.length,1);assert.ok(res.consultas>=7);assert.equal(res.respuestas,res.consultas-2);
});
test('respuesta parcial se informa sin inventar noticias',async()=>{
 let llamadas=0;
 const fake=async()=>{llamadas++;if(llamadas===1)throw Error('Fallo RSS');return{ok:true,text:async()=>feed(item('Inteligencia artificial en desarrollo de software','https://example.com.ar/a'))}};
 const p=validarParametros(new URLSearchParams('seccion=argentina&facultad=exactas&carrera=sistemas'));
 const res=await consultarNoticias(p,{fetchImpl:fake,reloj:()=>Date.parse('2026-10-28T12:00:00Z'),forzar:true});
 assert.ok(res.advertencia);assert.equal(res.noticias.length,1);
});

test('todas las consultas incorporan IA; las búsquedas libres no la desactivan',()=>{
 const p=validarParametros(new URLSearchParams('seccion=latinoamerica&facultad=salud&carrera=nutricion&q=obesidad'));
 const qs=construirConsultas(p);
 assert.ok(qs.length>=4);
 for(const q of qs){assert.match(q,/inteligencia artificial|artificial intelligence|\bIA\b|\bAI\b|machine learning/i);assert.match(q,/obesidad/i)}
});
test('detecta IA por términos explícitos y rechaza artículos generales',()=>{
 assert.equal(esNoticiaIA({titulo:'Nueva regulación sobre inteligencia artificial en Argentina'}),true);
 assert.equal(esNoticiaIA({titulo:'AI and teaching at university'}),true);
 assert.equal(esNoticiaIA({titulo:'Novedades del sistema universitario en América Latina'}),false);
 assert.equal(esNoticiaIA({titulo:'La familia participa en un debate cultural'}),false);
});
test('la disciplina es obligatoria cuando se selecciona carrera o facultad',()=>{
 const p=validarParametros(new URLSearchParams('facultad=salud&carrera=nutricion'));
 const f=FACULTADES.find(f=>f.id===p.facultad),c=f.carreras.find(c=>c.id===p.carrera);
 assert.equal(esNoticiaDeDisciplina({titulo:'La IA mejora diagnósticos nutricionales'},f,c),true);
 assert.equal(esNoticiaDeDisciplina({titulo:'La IA transforma los tribunales'},f,c),false);
});
test('la respuesta RSS nunca publica noticias sin IA o de otra carrera',async()=>{
 const p=validarParametros(new URLSearchParams('seccion=argentina&facultad=salud&carrera=nutricion'));
 const fake=async()=>({ok:true,text:async()=>feed(
   item('La IA ayuda a planificar dietas y nutrición','https://example.com.ar/a'),
   item('La IA cambia la justicia digital','https://example.org/b'),
   item('Nuevas dietas y nutrición','https://example.org/c')
 )});
 const res=await consultarNoticias(p,{fetchImpl:fake,reloj:()=>Date.parse('2026-10-28T12:00:00Z'),forzar:true});
 assert.equal(res.noticias.length,1);
 assert.match(res.noticias[0].titulo,/nutrici[oó]n/);
});


test('amplía la disciplina odontológica a cepillos dentales, aprendizaje automático y términos ingleses',()=>{
 const p=validarParametros(new URLSearchParams('facultad=odontologia&carrera=odontologia&periodo=90'));
 const conjunto=construirConsultas(p).join(' ');
 assert.match(conjunto,/cepillo de dientes/);
 assert.match(conjunto,/toothbrush/);
 assert.match(conjunto,/when:90d/);
 const fac=FACULTADES.find(f=>f.id==='odontologia'),carrera=fac.carreras[0];
 assert.equal(esNoticiaDeDisciplina({titulo:'Dyson presentó el CameraJet, un cepillo de dientes con IA incorporada'},fac,carrera),true);
 assert.equal(esNoticiaIA({titulo:'Dyson presentó el CameraJet, un cepillo de dientes con IA incorporada'}),true);
});

test('incluye consultas complementarias Bing, GDELT, medios nacionales y RSS editoriales',()=>{
 const p=validarParametros(new URLSearchParams('seccion=argentina&facultad=odontologia&carrera=odontologia'));
 const tareas=planificarFuentes(p);
 assert.ok(tareas.some(t=>t.url.includes('www.bing.com/news/search')));
 assert.ok(tareas.some(t=>t.url.includes('api.gdeltproject.org')));
 assert.ok(tareas.some(t=>t.url.includes('www.clarin.com/rss/tecnologia/')));
 assert.ok(tareas.some(t=>t.url.includes('www.infobae.com/arc/outboundfeeds/rss/')));
 assert.ok(tareas.some(t=>t.url.includes('www.lanacion.com.ar/arc/outboundfeeds/rss/')));
 for(const domain of ['lanacion.com.ar','infobae.com','clarin.com'])assert.ok(tareas.some(t=>decodeURIComponent(t.url).includes('site:'+domain)));
});

test('normaliza entradas GDELT sin mostrar artículos sin IA',()=>{
 const dat=parsearGDELT({articles:[{title:'Artificial intelligence reshapes oral care',url:'https://example.com/innovation',seendate:'20260902T110700Z',domain:'example.com'}]});
 assert.equal(dat[0].fecha,'2026-09-02T11:07:00.000Z');
 assert.equal(dat[0].origen,'GDELT');
});

test('noticia periodística de septiembre sobre cepillo con IA se encuentra a 90 días, no a 30',async()=>{
 const fecha=()=>Date.parse('2026-10-28T12:00:00Z');
 const title='Dyson presentó el CameraJet, un cepillo de dientes con cámara, irrigador e IA incorporada';
 const article='https://www.lanacion.com.ar/tecnologia/dyson-presento-el-camerajet-un-cepillo-de-dientes-con-camara-irrigador-e-ia-incorporada-nid02092026/';
 const feedLN=feed(item(title,article,'Wed, 02 Sep 2026 11:07:00 GMT'));
 const fake=async url=>({ok:true,text:async()=>url.includes('api.gdeltproject.org')?JSON.stringify({articles:[]}):url.includes('www.lanacion.com.ar/arc/')?feedLN:feed()});
 const p90=validarParametros(new URLSearchParams('seccion=argentina&facultad=odontologia&carrera=odontologia&periodo=90'));
 const res90=await consultarNoticias(p90,{fetchImpl:fake,reloj:fecha,forzar:true});
 assert.equal(res90.noticias.length,1);
 assert.equal(res90.noticias[0].url,article);
 const p30=validarParametros(new URLSearchParams('seccion=argentina&facultad=odontologia&carrera=odontologia&periodo=30'));
 const res30=await consultarNoticias(p30,{fetchImpl:fake,reloj:fecha,forzar:true});
 assert.equal(res30.noticias.length,0);
});

test('fusiona y deduplica múltiples proveedores; reporta fallos parciales con honestidad',async()=>{
 const noticia='IA aplicada a la higiene oral y el cepillo de dientes';
 const feedItem=feed(item(noticia,'https://www.clarin.com/tecnologia/nota-ia.html'));
 const p=validarParametros(new URLSearchParams('facultad=odontologia&carrera=odontologia'));
 const fake=async url=>{
   if(url.includes('bing.com'))throw Error('Bing fuera de línea');
   if(url.includes('gdeltproject'))return {ok:true,text:async()=>JSON.stringify({articles:[{title:noticia,url:'https://www.clarin.com/tecnologia/nota-ia.html',seendate:'20261026T100000Z'}]})};
   return {ok:true,text:async()=>feedItem};
 };
 const res=await consultarNoticias(p,{fetchImpl:fake,reloj:()=>Date.parse('2026-10-28T12:00:00Z'),forzar:true});
 assert.equal(res.noticias.length,1);
 assert.match(res.advertencia,/no respondieron/);
 assert.ok(res.fuentes.some(f=>f.nombre==='GDELT'));
});


test('fecha fija: consulta desde el 1 de enero de 2026 y no por últimos 365 días',()=>{
 const p=validarParametros(new URLSearchParams('seccion=argentina&facultad=odontologia&carrera=odontologia&periodo=desde2026'));
 assert.equal(p.periodo,'desde2026');
 const rangos=ventanasHistoricas(new Date('2026-10-28T12:00:00Z'));
 assert.deepEqual(rangos.map(x=>x.desde),['2026-01-01','2026-04-01','2026-07-01','2026-10-01']);
 assert.deepEqual(rangos.map(x=>x.hasta),['2026-04-01','2026-07-01','2026-10-01','2026-10-30']);
 const plan=planificarFuentes(p,new Date('2026-10-28T12:00:00Z'));
 const goog=plan.filter(x=>x.nombre==='Google News'&&!decodeURIComponent(x.url).includes('site:'));
 assert.ok(goog.length>=16);
 for(const rango of rangos){assert.ok(goog.some(t=>decodeURIComponent(t.url).includes('before:'+rango.hasta)),rango.hasta)}
 assert.ok(goog.some(t=>new URL(t.url).searchParams.get('q').includes('IA "cepillo de dientes"')));
});

test('2026 completo: recoge enero, septiembre y descarta 2025 y otra carrera',async()=>{
 const p=validarParametros(new URLSearchParams('seccion=argentina&facultad=odontologia&carrera=odontologia&periodo=desde2026'));
 const fake=async(url)=>({ok:true,text:async()=>url.includes('gdeltproject')?JSON.stringify({articles:[]}):feed(
   item('IA en odontología: investigación en enero','https://example.com.ar/enero','Fri, 02 Jan 2026 10:00:00 GMT'),
   item('Tres jóvenes crean una IA para atender pacientes odontológicos','https://example.com.ar/septiembre','Tue, 01 Sep 2026 10:00:00 GMT'),
   item('IA para odontología en diciembre pasado','https://example.org/diciembre','Wed, 31 Dec 2025 10:00:00 GMT'),
   item('IA transforma los tribunales','https://example.org/tribunales','Tue, 01 Sep 2026 10:00:00 GMT')
 )});
 const r=await consultarNoticias(p,{fetchImpl:fake,reloj:()=>Date.parse('2026-10-28T12:00:00Z'),forzar:true});
 assert.equal(r.noticias.length,2);
 assert.ok(r.diagnostico.fueraPeriodo>0);
 assert.ok(r.diagnostico.sinDisciplina>0);
 assert.deepEqual(r.noticias.map(n=>n.url).sort(),['https://example.com.ar/enero','https://example.com.ar/septiembre']);
});

test('histórico: se informa diferencia entre fuentes que responden y noticias que superan el filtro',async()=>{
 const p=validarParametros(new URLSearchParams('seccion=argentina&facultad=odontologia&carrera=odontologia&periodo=desde2026'));
 const fake=async(url)=>({ok:true,text:async()=>url.includes('gdeltproject')?JSON.stringify({articles:[]}):feed(item('Novedades sobre política internacional','https://example.com/a'))});
 const r=await consultarNoticias(p,{fetchImpl:fake,reloj:()=>Date.parse('2026-10-28T12:00:00Z'),forzar:true});
 assert.equal(r.noticias.length,0);
 assert.ok(r.diagnostico.recibidas>0);
 assert.ok(r.diagnostico.sinIA>0);
});


test('país por título prevalece sobre edición argentina y sobre medio argentino',()=>{
 const per={titulo:'La Semana de Humanidades 2026 abordó la IA, la psicología y la cultura',fuente:'Universidad de Piura - UDEP',url:'https://news.google.com/rss/a'};
 const mex={titulo:'¿ChatGPT en lugar de ir al psicólogo? 30% de los jóvenes en Morelos busca la IA para su salud mental',fuente:'El Sol de México',url:'https://news.google.com/rss/b'};
 assert.equal(clasificarGeografia(per).pais,'Perú');
 assert.equal(clasificarGeografia(mex).pais,'México');
 assert.equal(correspondeASeccion(per,'argentina'),false);
 assert.equal(correspondeASeccion(mex,'argentina'),false);
 assert.equal(correspondeASeccion(per,'latinoamerica'),true);
 assert.equal(correspondeASeccion(mex,'latinoamerica'),true);
 const cross={titulo:'Inteligencia artificial en salud dental en Perú',fuente:'LA NACION',url:'https://www.lanacion.com.ar/salud/nota'};
 assert.equal(clasificarGeografia(cross).pais,'Perú');
});

test('fuentes nacionales se admiten, pero sin país identificable no se asignan a Argentina',()=>{
 const ar={titulo:'IA utilizada en psicología clínica',fuente:'LA NACION',url:'https://news.google.com/rss/a'};
 const anon={titulo:'IA utilizada en psicología clínica',fuente:'Medio sin país',url:'https://news.google.com/rss/b'};
 assert.equal(correspondeASeccion(ar,'argentina'),true);
 assert.equal(correspondeASeccion(anon,'argentina'),false);
 assert.equal(clasificarGeografia(anon).criterio,'sin_evidencia');
});

test('la sección Universidades es transversal, las tres regiones no se mezclan',()=>{
 const ar={titulo:'IA en psicología en Buenos Aires',fuente:'Revista',url:'https://example.org/a'};
 const pe={titulo:'IA en psicología en Piura',fuente:'Revista',url:'https://example.org/b'};
 const uk={titulo:'AI in psychology at Oxford University',fuente:'News',url:'https://example.org/c'};
 for(const item of [ar,pe,uk])assert.equal(correspondeASeccion(item,'universidades'),true);
 assert.equal(correspondeASeccion(ar,'argentina'),true);
 assert.equal(correspondeASeccion(ar,'latinoamerica'),false);
 assert.equal(correspondeASeccion(pe,'latinoamerica'),true);
 assert.equal(correspondeASeccion(pe,'internacional'),false);
 assert.equal(correspondeASeccion(uk,'internacional'),true);
});

test('integración: Psicología conserva filtro disciplinar, muestra Perú y México solo en Latinoamérica',async()=>{
 const per=item('La Semana de Humanidades 2026 abordó la IA, la psicología y la cultura','https://www.udep.edu.pe/noticias/psicologia-ia/');
 const mex=item('¿ChatGPT en lugar de ir al psicólogo? 30% de los jóvenes en Morelos busca la IA para su salud mental','https://www.elsoldemexico.com.mx/ia-salud-mental');
 const arg=item('Inteligencia artificial aplicada a la psicología en Buenos Aires','https://www.lanacion.com.ar/sociedad/ia-psicologia');
 const fake=async url=>({ok:true,text:async()=>url.includes('api.gdeltproject.org')?JSON.stringify({articles:[]}):feed(per,mex,arg)});
 const base='facultad=humanidades&carrera=psicologia&periodo=desde2026';
 const reloj=()=>Date.parse('2026-10-28T12:00:00Z');
 const ar=await consultarNoticias(validarParametros(new URLSearchParams('seccion=argentina&'+base)),{fetchImpl:fake,reloj,forzar:true});
 const latam=await consultarNoticias(validarParametros(new URLSearchParams('seccion=latinoamerica&'+base)),{fetchImpl:fake,reloj,forzar:true});
 const universidades=await consultarNoticias(validarParametros(new URLSearchParams('seccion=universidades&'+base)),{fetchImpl:fake,reloj,forzar:true});
 assert.equal(ar.noticias.length,1);
 assert.equal(ar.noticias[0].pais,'Argentina');
 assert.deepEqual(latam.noticias.map(n=>n.pais).sort(),['México','Perú']);
 assert.equal(universidades.noticias.length,3);
 assert.ok(ar.diagnostico.fueraRegion>=2);
});

test('Arquitectura: descarta arquitectura de datos y conserva arquitectura edilicia, urbanismo y BIM',()=>{
 const facultad=FACULTADES.find(f=>f.id==='arquitectura');
 const carrera=facultad.carreras.find(c=>c.id==='arquitectura');
 for(const titulo of [
   'Gran salida laboral: la UTN te enseña Arquitectura de Datos con IA desde cero',
   'IA: arquitectura de software para aplicaciones más rápidas',
   'Los arquitectos de datos con IA son cada vez más buscados',
   'Nuevas arquitecturas de redes neuronales y procesadores con IA',
   'Artificial intelligence transforms data architecture in cloud systems'
 ])assert.equal(esNoticiaDeDisciplina({titulo},facultad,carrera),false,titulo);
 for(const titulo of [
   'Archicad 30 llega con nuevas herramientas de inteligencia artificial para arquitectura y construcción',
   'Inteligencia artificial mejora el diseño arquitectónico de edificios sustentables',
   'IA aplicada al urbanismo y la planificación de ciudades',
   'AI tools assist architects with BIM projects',
   'Inteligencia artificial para proyectos de arquitectura residencial'
 ])assert.equal(esNoticiaDeDisciplina({titulo},facultad,carrera),true,titulo);
});

test('Arquitectura: consultas focalizadas en edificios, diseño y construcción y no en datos informáticos',()=>{
 const p=validarParametros(new URLSearchParams('facultad=arquitectura&carrera=arquitectura&periodo=desde2026'));
 const plan=planificarFuentes(p,new Date('2026-10-28'));
 const queries=plan.filter(x=>x.nombre==='Google News').map(x=>new URL(x.url).searchParams.get('q'));
 assert.ok(queries.some(q=>q.includes('diseño arquitectónico')));
 assert.ok(queries.some(q=>q.includes('construcción')));
 assert.equal(queries.some(q=>q.includes('arquitectura de datos')),false);
});

test('Arquitectura + Argentina: integración excluye cursos de arquitectura de datos',async()=>{
 const p=validarParametros(new URLSearchParams('seccion=argentina&facultad=arquitectura&carrera=arquitectura'));
 const fake=async()=>({ok:true,text:async()=>feed(
   item('Gran salida laboral: la UTN te enseña Arquitectura de Datos con IA desde cero','https://ejemplo.com.ar/utn'),
   item('Archicad 30 llega con nuevas herramientas de inteligencia artificial para arquitectura y construcción','https://ejemplo.com.ar/archicad')
 )});
 const r=await consultarNoticias(p,{fetchImpl:fake,reloj:()=>Date.parse('2026-10-28T12:00:00Z'),forzar:true});
 assert.equal(r.noticias.length,1);
 assert.match(r.noticias[0].titulo,/archicad/i);
 assert.ok(r.diagnostico.sinDisciplina>0);
});
