import { enlaceWhatsApp } from './compartir.mjs';
const $=s=>document.querySelector(s);
const $$=s=>Array.from(document.querySelectorAll(s));
const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const enlaceSeguro=s=>{try {const u=new URL(s);return ['https:','http:'].includes(u.protocol)?u.href:'#';}catch{return '#';}};
const KEY='ucalp-observatorio-biblioteca-ia-v2';
function cargarFavoritos(){try{const x=JSON.parse(localStorage.getItem(KEY)||'{}');return x&&typeof x==='object'&&!Array.isArray(x)?x:{}}catch{return{}}}
const state={catalogo:[],seccion:'argentina',facultad:'',carrera:'',periodo:'desde2026',q:'',orden:'fecha',medio:'todos',fuentes:[],diagnostico:{},consultas:0,respuestas:0,vista:'noticias',noticias:[],guardados:cargarFavoritos(),cargando:false,error:'',adver:'',fecha:null,enlaces:null,cantidadVisible:12,seq:0,abort:null};
const secciones={argentina:'Argentina',latinoamerica:'Latinoamérica',internacional:'Internacional',universidades:'Universidades'};
function facultadActual(){return state.catalogo.find(x=>x.id===state.facultad)||null}
function carreraActual(){return facultadActual()?.carreras.find(x=>x.id===state.carrera)||null}
function fecha(s){if(!s)return 'Sin fecha';const n=new Date(s);return Number.isNaN(n.getTime())?'Sin fecha':n.toLocaleDateString('es-AR',{day:'2-digit',month:'short',year:'numeric'})}
function persistir(){try{localStorage.setItem(KEY,JSON.stringify(state.guardados))}catch{state.error='No hay espacio para guardar en este navegador.'}}
function actualizarRuta(){const sp=new URLSearchParams();sp.set('seccion',state.seccion);if(state.facultad)sp.set('facultad',state.facultad);if(state.carrera)sp.set('carrera',state.carrera);if(state.q)sp.set('q',state.q);if(state.periodo!=='desde2026')sp.set('periodo',String(state.periodo));history.replaceState(null,'',location.pathname+'?'+sp)}
function inicializarRuta(){const sp=new URLSearchParams(location.search);if(secciones[sp.get('seccion')])state.seccion=sp.get('seccion');if(state.catalogo.some(f=>f.id===sp.get('facultad')))state.facultad=sp.get('facultad');if(facultadActual()?.carreras.some(c=>c.id===sp.get('carrera')))state.carrera=sp.get('carrera');state.q=(sp.get('q')||'').slice(0,90);if(sp.get('periodo')==='desde2026')state.periodo='desde2026';else if([7,30,90,180,365].includes(Number(sp.get('periodo'))))state.periodo=Number(sp.get('periodo'))}
function mostrarDisciplinas(abierto){
  const movil=window.matchMedia('(max-width:780px)').matches;
  $('#portal').classList.toggle('sidebar-open', abierto);
  $('#portal').classList.toggle('sidebar-collapsed', !abierto && !movil);
  $('#filters-backdrop').hidden=!(abierto&&movil);
  document.body.classList.toggle('sidebar-scroll-lock', abierto&&movil);
  $('#abrir-disciplinas').setAttribute('aria-expanded',String(abierto));
  $('#disciplinas-sidebar').setAttribute('aria-hidden',String(!abierto));
  // El panel oculto no puede recibir tabulación de teclado.
  $('#disciplinas-sidebar').inert=!abierto;
  if(abierto&&movil)$('#cerrar-disciplinas').focus();
}
function cerrarSiMovil(){
  if(window.matchMedia('(max-width:780px)').matches){
    mostrarDisciplinas(false);
    $('#abrir-disciplinas').focus();
  }
}
function renderFacultades(){
  $('#fac-num').textContent=String(state.catalogo.length).padStart(2,'0');
  $('#facultades').innerHTML=state.catalogo.map(f=>`<button type="button" data-facultad="${escapeHTML(f.id)}" class="faculty-btn ${f.id===state.facultad?'active':''}" aria-pressed="${f.id===state.facultad}"><span class="fac-ico" aria-hidden="true">${escapeHTML(f.icono)}</span><span>${escapeHTML(f.nombre)}</span><span class="fac-arrow" aria-hidden="true">›</span></button>`).join('');
  const fac=facultadActual();const carrera=$('#carrera');carrera.disabled=!fac;
  carrera.innerHTML=`<option value="">Todas las carreras</option>${(fac?.carreras||[]).map(c=>`<option value="${escapeHTML(c.id)}">${escapeHTML(c.nombre)}</option>`).join('')}`;
  carrera.value=state.carrera;
  $('#carrera-hint').textContent=fac?`${fac.carreras.length} áreas académicas disponibles. Se agrupan modalidades equivalentes.`:'Elegí primero una facultad.';
  const nombre=carreraActual()?.nombre||fac?.nombre||'Todas las disciplinas';
  const descripcion=carreraActual()?`Se muestran noticias que mencionan IA y áreas relacionadas con ${nombre.toLowerCase()}; no necesitan mencionar el título de la carrera.`:fac?fac.descripcion:'Noticias sobre inteligencia artificial aplicada a todas las disciplinas de la UCALP.';
  $('#etiqueta-disciplinas').textContent=nombre==='Todas las disciplinas'?'Facultades y carreras':nombre;
  $('#focus-box').innerHTML=`<span class="upper">FOCO SELECCIONADO</span><p><strong>${escapeHTML(nombre)}</strong><br>${escapeHTML(descripcion)}</p>`;
}
function renderCabecera(){
  $$('.geotab').forEach(b=>{const activo=b.dataset.seccion===state.seccion;b.classList.toggle('active',activo);if(activo)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
  $('#feed-titulo').innerHTML=`IA en <em>${escapeHTML(secciones[state.seccion])}</em>`;
  const carrera=carreraActual(),fac=facultadActual();
  $('#feed-subtitulo').textContent=carrera?`Perspectiva: ${carrera.nombre} · ${fac.nombre}`:fac?`Perspectiva: ${fac.nombre} · Todas las carreras`:'Solo noticias sobre inteligencia artificial en las disciplinas de la UCALP.';
  $('#buscar').value=state.q;$('#periodo').value=String(state.periodo);$('#orden').value=state.orden;$('#medio').value=state.medio;
  $('#saved-count').textContent=Object.keys(state.guardados).length;
  $$('.view').forEach(b=>{const a=b.dataset.vista===state.vista;b.classList.toggle('active',a);b.setAttribute('aria-selected',String(a))});
  $('#count').textContent=state.vista==='noticias'?String(itemsVisibles().length):String(state.noticias.length);
  $('#actualizado').textContent=state.fecha?`CONSULTA ${new Date(state.fecha).toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'})}`:'Sin consultar';
  $('#recargar').disabled=state.cargando;
  $('#fuentes-info').textContent=state.respuestas?`FUENTES: ${state.fuentes.map(f=>f.nombre).join(' · ')} · ${state.respuestas}/${state.consultas} consultas respondieron · ${state.diagnostico?.recibidas||0} artículos recibidos · ${state.noticias.length} pertinentes · ${state.diagnostico?.fueraRegion||0} de otra región · ${state.diagnostico?.ubicacionIncierta||0} sin país identificable`:'Fuentes: Google News · Bing News · GDELT · RSS editoriales';
  $('#media-links').innerHTML=state.enlaces?.paginas?'<span>Continuar búsqueda:</span>'+Object.entries(state.enlaces.paginas).map(([nombre,url])=>`<a href="${escapeHTML(enlaceSeguro(url))}" target="_blank" rel="noopener noreferrer">${escapeHTML(nombre)} ↗</a>`).join(''):'';
  $('#contexto').textContent=state.vista==='guardados'?'Noticias guardadas solamente en este navegador. Podés anotar y exportar tu biblioteca.':
    `Buscando IA en ${secciones[state.seccion]}${fac?' · '+fac.nombre:''}${carrera?' · '+carrera.nombre:''} · ${state.periodo==='desde2026'?'Desde el 01/01/2026':`Últimos ${state.periodo} días`}${state.q?' · '+state.q:''}.`;
}
function esDelMedio(item,medio){const f=String(item.fuente||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();const grupo=f.includes('nacion')?'LA NACION':f.includes('clarin')?'Clarín':f.includes('infobae')?'Infobae':'otros';return medio==='todos'||grupo===medio;}
function itemsVisibles(){let items=state.vista==='guardados'?Object.values(state.guardados).map(x=>x.item):state.noticias;
  if(state.vista==='noticias')items=items.filter(x=>esDelMedio(x,state.medio));
  if(state.vista==='guardados'&&state.q){const t=state.q.toLocaleLowerCase();items=items.filter(x=>`${x.titulo} ${x.fuente} ${x.resumen}`.toLocaleLowerCase().includes(t))}
  return [...items].sort(state.orden==='fuente'?(a,b)=>String(a.fuente).localeCompare(String(b.fuente),'es'):(a,b)=>Date.parse(b.fecha||0)-Date.parse(a.fecha||0));
}
function tarjeta(item,index){const saved=!!state.guardados[item.url];const id=String(index);const nota=saved?state.guardados[item.url]?.nota||'':'';
  return `<article class="news-card"><div class="card-top"><div class="meta"><span class="source-dot"></span><span>${escapeHTML(item.fuente||'Fuente no identificada')}</span><i>/</i><time datetime="${escapeHTML(item.fecha||'')}">${escapeHTML(fecha(item.fecha))}</time></div><span class="topic-chip">${escapeHTML(state.vista==='guardados'?'BIBLIOTECA':'INTELIGENCIA ARTIFICIAL')}</span></div>
  ${item.pais?`<div class="region-label" aria-label="País estimado de la noticia">⌖ ${escapeHTML(item.pais)}${item.criterioPais==='medio'||item.criterioPais==='dominio'?' · según el medio':''}</div>`:''}
  <h3><a href="${escapeHTML(enlaceSeguro(item.url))}" target="_blank" rel="noopener noreferrer">${escapeHTML(item.titulo)}</a></h3>${item.resumen?`<p class="summary">${escapeHTML(item.resumen)}</p>`:''}
  <div class="card-bottom"><span class="scope">${escapeHTML(item.origen||'Fuente externa')} · Verificá la información</span><div class="card-links"><button type="button" data-action="guardar" data-index="${id}" class="${saved?'saved':''}" aria-label="${saved?'Quitar noticia guardada':'Guardar noticia'}">${saved?'★ Guardada':'☆ Guardar'}</button>${enlaceWhatsApp(item)?`<a class="share-whatsapp" href="${escapeHTML(enlaceWhatsApp(item))}" target="_blank" rel="noopener noreferrer" aria-label="Compartir noticia por WhatsApp" title="Compartir título y enlace por WhatsApp"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z"/><path d="M8.5 9.3c.5 3 2.4 4.9 5.4 5.4l1.6-1.3"/></svg>WhatsApp</a>`:''}${state.vista==='guardados'?`<button type="button" data-action="nota" data-index="${id}">✎ Nota</button>`:''}<a href="${escapeHTML(enlaceSeguro(item.url))}" target="_blank" rel="noopener noreferrer">Leer noticia ↗</a></div></div>
  ${state.vista==='guardados'?`<div class="saved-note" data-notebox="${id}" hidden><label for="nota-${id}">NOTA DE LECTURA</label><textarea id="nota-${id}" maxlength="1500" placeholder="Anotá una idea para una clase, reunión o investigación…">${escapeHTML(nota)}</textarea><button data-action="guardar-nota" data-index="${id}" type="button">Guardar nota</button></div>`:''}</article>`;
}
function explicarCero(){
  if(state.medio!=='todos'&&state.noticias.length)return `Hay ${state.noticias.length} noticias de IA en la búsqueda, pero ninguna corresponde al medio elegido. Probá Todos los medios.`;
  const d=state.diagnostico||{};
  if(d.recibidas===0)return 'Las fuentes consultadas no devolvieron artículos, aunque hayan respondido. Puede deberse a límites o restricciones de los proveedores; probá la búsqueda externa.';
  const razones=[];
  if(d.fueraPeriodo)razones.push(`${d.fueraPeriodo} fuera de fecha`);
  if(d.sinIA)razones.push(`${d.sinIA} sin referencia explícita a IA`);
  if(d.sinDisciplina)razones.push(`${d.sinDisciplina} sin relación reconocible con la disciplina`);
  if(d.sinTexto)razones.push(`${d.sinTexto} sin el texto buscado`);
  if(d.fueraRegion)razones.push(`${d.fueraRegion} de otra región`);
  if(d.ubicacionIncierta)razones.push(`${d.ubicacionIncierta} sin país identificable`);
  return `Se recibieron ${d.recibidas} artículos, pero ninguno pasó todos los filtros.${razones.length?' Motivos: '+razones.join('; ')+'.':''} Podés probar otra carrera o continuar la búsqueda externa.`;
}
function renderNoticias(){renderCabecera();const zona=$('#resultados'),st=$('#estado'),more=$('#mas-wrap');more.innerHTML='';st.innerHTML='';
  if(state.vista==='noticias'&&state.cargando){zona.innerHTML='';st.innerHTML='<div class="state loading"><strong>Buscando noticias…</strong>Buscando noticias que relacionen inteligencia artificial y la disciplina seleccionada. Puede tardar unos segundos.</div>';return}
  if(state.vista==='noticias'&&state.error){zona.innerHTML='';st.innerHTML=`<div class="state error"><strong>No pudimos actualizar el Monitor de Noticias.</strong>${escapeHTML(state.error)}<div><button type="button" id="reintentar">Reintentar</button> &nbsp; <a href="${escapeHTML(enlaceSeguro(state.enlaces?.google||enlaceGoogleAlternativo()))}" target="_blank" rel="noopener noreferrer">Buscar directamente en Google News ↗</a></div></div>`;return}
  const datos=itemsVisibles();
  if(!datos.length){zona.innerHTML='';const alternativo=state.enlaces?.paginas?.[state.medio]||state.enlaces?.google||enlaceGoogleAlternativo();st.innerHTML=`<div class="state empty"><strong>${state.vista==='guardados'?'Tu biblioteca está vacía.':'No encontramos noticias de IA con estos filtros.'}</strong>${state.vista==='guardados'?'Guardá artículos desde la sección Noticias para crear una biblioteca personal.':explicarCero()} ${state.vista==='noticias'?`<p><a target="_blank" rel="noopener noreferrer" href="${escapeHTML(enlaceSeguro(alternativo))}">Continuar búsqueda externa ↗</a></p>`:''}</div>`;return}
  if(state.vista==='noticias'&&state.adver)st.innerHTML=`<div class="state">${escapeHTML(state.adver)}</div>`;
  zona.innerHTML=datos.slice(0,state.cantidadVisible).map((x,i)=>tarjeta(x,i)).join('');
  if(datos.length>state.cantidadVisible)more.innerHTML=`<button type="button" id="vermas">Mostrar más noticias (${datos.length-state.cantidadVisible} restantes) ↓</button>`;
}
function enlaceGoogleAlternativo(){const f=facultadActual(),c=carreraActual();const t=state.q||('inteligencia artificial '+(c?.nombre||f?.nombre||'educación universidades'));return 'https://news.google.com/search?q='+encodeURIComponent(t+' '+(state.seccion==='argentina'?'Argentina':state.seccion==='latinoamerica'?'Latinoamérica':''))}
function refrescar(forzar=false){
  state.seq++;const sec=state.seq;state.abort?.abort();const ab=new AbortController();state.abort=ab;
  state.cargando=true;state.error='';state.adver='';state.cantidadVisible=12;actualizarRuta();renderNoticias();
  const p=new URLSearchParams({seccion:state.seccion,periodo:String(state.periodo)});
  if(state.facultad)p.set('facultad',state.facultad);if(state.carrera)p.set('carrera',state.carrera);if(state.q)p.set('q',state.q);
  if(forzar)p.set('forzar','1');
  fetch('/api/noticias?'+p,{signal:ab.signal}).then(async r=>{const data=await r.json();if(!r.ok||!data.ok)throw new Error(data.error||`HTTP ${r.status}`);return data}).then(d=>{
    if(sec!==state.seq)return;state.noticias=d.noticias||[];state.fecha=d.fechaConsulta;state.enlaces=d.enlaces;state.fuentes=d.fuentes||[];state.diagnostico=d.diagnostico||{};state.consultas=d.consultas||0;state.respuestas=d.respuestas||0;state.adver=d.advertencia||'';state.cargando=false;renderNoticias();
  }).catch(e=>{if(sec!==state.seq||e.name==='AbortError')return;state.error=e.message;state.cargando=false;renderNoticias()});
}
function cambiarFacultad(id){if(id===state.facultad){state.facultad='';state.carrera=''}else{state.facultad=id;state.carrera=''}state.vista='noticias';renderFacultades();refrescar();cerrarSiMovil()}
function toggleFavorito(item){if(state.guardados[item.url])delete state.guardados[item.url];else state.guardados[item.url]={item,nota:'',guardadoEn:new Date().toISOString()};persistir();renderNoticias()}
function exportarCSV(){const valores=Object.values(state.guardados);
  if(!valores.length){alert('Todavía no guardaste ninguna noticia.');return}
  const head=['Título','Fuente','Fecha','URL','Nota personal'];const filas=valores.map(({item,nota})=>[item.titulo,item.fuente,fecha(item.fecha),item.url,nota||'']);
  const q=s=>'"'+String(s??'').replace(/"/g,'""').replace(/\r?\n/g,' ')+'"';
  const csv='\ufeff'+[head,...filas].map(row=>row.map(q).join(';')).join('\r\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),href=URL.createObjectURL(blob),a=document.createElement('a');a.href=href;a.download='monitor_noticias_ucalp_guardados.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(href),1000);
}
function registrarEventos(){
  $('#abrir-disciplinas').addEventListener('click',()=>mostrarDisciplinas($('#abrir-disciplinas').getAttribute('aria-expanded')!=='true'));
  $('#cerrar-disciplinas').addEventListener('click',()=>{mostrarDisciplinas(false);$('#abrir-disciplinas').focus()});
  $('#filters-backdrop').addEventListener('click',()=>mostrarDisciplinas(false));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#abrir-disciplinas').getAttribute('aria-expanded')==='true'&&window.matchMedia('(max-width:780px)').matches){mostrarDisciplinas(false);$('#abrir-disciplinas').focus()}});
  window.matchMedia('(max-width:780px)').addEventListener('change',ev=>mostrarDisciplinas(!ev.matches));
  $('#secciones').addEventListener('click',e=>{const b=e.target.closest('[data-seccion]');if(!b||b.dataset.seccion===state.seccion)return;state.seccion=b.dataset.seccion;state.vista='noticias';refrescar()});
  $('#facultades').addEventListener('click',e=>{const b=e.target.closest('[data-facultad]');if(b)cambiarFacultad(b.dataset.facultad)});
  $('#carrera').addEventListener('change',e=>{state.carrera=e.target.value;state.vista='noticias';renderFacultades();refrescar();cerrarSiMovil()});
  $('#reset-facultad').addEventListener('click',()=>{state.facultad='';state.carrera='';state.vista='noticias';renderFacultades();refrescar();cerrarSiMovil()});
  $('#buscar-form').addEventListener('submit',e=>{e.preventDefault();state.q=$('#buscar').value.trim().slice(0,90);state.vista='noticias';refrescar()});
  $('#limpiar-texto').addEventListener('click',()=>{state.q='';$('#buscar').value='';state.vista='noticias';refrescar()});
  $('#periodo').addEventListener('change',e=>{state.periodo=e.target.value==='desde2026'?'desde2026':Number(e.target.value);refrescar()});
  $('#orden').addEventListener('change',e=>{state.orden=e.target.value;renderNoticias()});
  $('#medio').addEventListener('change',e=>{state.medio=e.target.value;state.cantidadVisible=12;renderNoticias()});
  $('#recargar').addEventListener('click',()=>refrescar(true));
  $('.view-switch').addEventListener('click',e=>{const b=e.target.closest('[data-vista]');if(!b)return;state.vista=b.dataset.vista;state.cantidadVisible=12;renderNoticias()});
  $('#resultados').addEventListener('click',e=>{
    const b=e.target.closest('[data-action]');if(!b)return;
    const idx=Number(b.dataset.index);const item=itemsVisibles()[idx];if(!item)return;
    if(b.dataset.action==='guardar')toggleFavorito(item);
    if(b.dataset.action==='nota'){const panel=b.closest('.news-card').querySelector('[data-notebox]');if(panel)panel.hidden=!panel.hidden}
    if(b.dataset.action==='guardar-nota'){const texto=b.closest('.news-card').querySelector('textarea')?.value||'';const reg=state.guardados[item.url];if(reg){reg.nota=texto.slice(0,1500);persistir();renderNoticias()}}
  });
  $('#mas-wrap').addEventListener('click',e=>{if(e.target.closest('#vermas')){state.cantidadVisible+=12;renderNoticias()}});
  $('#estado').addEventListener('click',e=>{if(e.target.closest('#reintentar'))refrescar(true)});
  $('#exportar').addEventListener('click',exportarCSV);
}
async function inicializar(){registrarEventos();mostrarDisciplinas(!window.matchMedia('(max-width:780px)').matches);
  try {const r=await fetch('/assets/catalogo.json');if(!r.ok)throw Error('No se encontró el catálogo de facultades');state.catalogo=await r.json();inicializarRuta();renderFacultades();refrescar()}
  catch(e){$('#facultades').textContent='No se pudo cargar el listado de facultades.';state.error=e.message;renderNoticias()}
}
inicializar();
