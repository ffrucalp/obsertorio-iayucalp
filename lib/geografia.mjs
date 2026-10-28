/**
 * Clasificador geográfico conservador. La edición regional de un buscador (gl=AR)
 * NO indica el país de una noticia. Se buscan señales explícitas en el titular,
 * la descripción y, subsidiariamente, en el medio o su dominio.
 *
 * Un medio local puede publicar noticias extranjeras: en esos casos manda el
 * lugar mencionado en el titular, no el país del medio.
 *
 * Cuando no hay evidencia, se excluye de las tres secciones geográficas para
 * no presentar como argentina/latinoamericana/internacional una noticia incierta.
 */
const normalizar=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const paises=[
 {pais:'Argentina',region:'argentina',exp:['argentina','buenos aires','la plata','mar del plata','bariloche','patagonia','conicet','universidad de buenos aires','universidad nacional de la plata','unlp','universidad nacional de cordoba','uba','utn','rosario argentina','mendoza argentina','tucuman','neuquen','jujuy','ushuaia','chubut','cordoba argentina','cordoba, ar','salta argentina','caba','capital federal','rio negro argentina']},
 {pais:'México',region:'latinoamerica',exp:['mexico','morelos','cdmx','ciudad de mexico','unam','universidad nacional autonoma de mexico','guadalajara','jalisco','queretaro','oaxaca','chiapas','puebla mexico','monterrey','nuevo leon','zacatecas','baja california','tabasco mexico']},
 {pais:'Perú',region:'latinoamerica',exp:['peru','piura','udep','universidad de piura','pucp','arequipa','cusco','lima peru','universidad nacional mayor de san marcos','trujillo peru']},
 {pais:'Colombia',region:'latinoamerica',exp:['colombia','bogota','medellin','barranquilla','cartagena colombia','cali colombia','antioquia']},
 {pais:'Chile',region:'latinoamerica',exp:['chile','santiago de chile','valparaiso','concepcion chile','universidad de chile','universidad catolica de chile','biobio']},
 {pais:'Brasil',region:'latinoamerica',exp:['brasil','brazil','brasilia','sao paulo','rio de janeiro','rio grande do sul','porto alegre','curitiba','usp brasil']},
 {pais:'Uruguay',region:'latinoamerica',exp:['uruguay','montevideo','udelar']},
 {pais:'Paraguay',region:'latinoamerica',exp:['paraguay','asuncion']},
 {pais:'Bolivia',region:'latinoamerica',exp:['bolivia','la paz bolivia','santa cruz bolivia','cochabamba']},
 {pais:'Ecuador',region:'latinoamerica',exp:['ecuador','quito','guayaquil']},
 {pais:'Venezuela',region:'latinoamerica',exp:['venezuela','caracas','maracaibo']},
 {pais:'Costa Rica',region:'latinoamerica',exp:['costa rica','san jose costa rica']},
 {pais:'Panamá',region:'latinoamerica',exp:['panama','ciudad de panama']},
 {pais:'Guatemala',region:'latinoamerica',exp:['guatemala']},
 {pais:'Cuba',region:'latinoamerica',exp:['cuba','la habana','havana']},
 {pais:'República Dominicana',region:'latinoamerica',exp:['republica dominicana','santo domingo dominicana']},
 {pais:'Honduras',region:'latinoamerica',exp:['honduras','tegucigalpa']},
 {pais:'Nicaragua',region:'latinoamerica',exp:['nicaragua','managua']},
 {pais:'El Salvador',region:'latinoamerica',exp:['el salvador pais','san salvador']},
 {pais:'Puerto Rico',region:'latinoamerica',exp:['puerto rico','san juan puerto rico']},
 {pais:'Estados Unidos',region:'internacional',exp:['estados unidos','eeuu','ee uu','united states','new york','nueva york','washington dc','california','silicon valley','harvard','stanford','mit university','massachusetts','nasa']},
 {pais:'Reino Unido',region:'internacional',exp:['reino unido','united kingdom','inglaterra','londres','london','oxford university','universidad de oxford','cambridge university','universidad de cambridge']},
 {pais:'España',region:'internacional',exp:['espana','spain','madrid','barcelona','valencia espana','universidad complutense']},
 {pais:'Francia',region:'internacional',exp:['francia','france','paris francia','paris france','sorbona']},
 {pais:'Alemania',region:'internacional',exp:['alemania','germany','berlin','munich']},
 {pais:'Italia',region:'internacional',exp:['italia','italy','roma italia','milan italia']},
 {pais:'China',region:'internacional',exp:['china','beijing','pekin','shanghai','tsinghua']},
 {pais:'Japón',region:'internacional',exp:['japon','japan','tokio','tokyo','osaka']},
 {pais:'Corea del Sur',region:'internacional',exp:['corea del sur','south korea','seul','seoul']},
 {pais:'India',region:'internacional',exp:['india','nueva delhi','new delhi','mumbai']},
 {pais:'Australia',region:'internacional',exp:['australia','sydney','melbourne']},
 {pais:'Canadá',region:'internacional',exp:['canada','toronto','montreal']},
 {pais:'Singapur',region:'internacional',exp:['singapur','singapore']},
 {pais:'Israel',region:'internacional',exp:['israel','tel aviv','jerusalen']},
 {pais:'Sudáfrica',region:'internacional',exp:['sudafrica','south africa','cape town']},
 {pais:'Unión Europea',region:'internacional',exp:['union europea','european union','comision europea','european commission','bruselas','brussels','ue ai act','eu ai act']},
];
const reTerm=x=>new RegExp(`(^|[^a-z0-9])${normalizar(x).replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/\s+/g,'\\s+')}($|[^a-z0-9])`,'i');
const reglas=paises.map(p=>({...p,regs:p.exp.map(reTerm)}));
const fuentePaises=[
 {pais:'Argentina',terminos:['la nacion','clarin','tn argentina','pagina 12','ambito financiero','perfil argentina','universidad nacional de la plata','infocielo','0221','el dia la plata','telefe','conicet','agencia telam']},
 {pais:'México',terminos:['el sol de mexico','milenio','reforma mexico','excelsior','unam','el universal mexico','proceso mexico','el financiero mexico']},
 {pais:'Perú',terminos:['universidad de piura','udep','el comercio peru','rpp noticias','la republica peru','andina peru']},
 {pais:'Colombia',terminos:['el tiempo colombia','semana colombia','el espectador','caracol radio','rcn colombia']},
 {pais:'Chile',terminos:['la tercera','emol','el mercurio chile','biobiochile']},
 {pais:'Brasil',terminos:['folha de s paulo','oglobo','o globo','g1 globo']},
 {pais:'Reino Unido',terminos:['bbc','the guardian','the independent','financial times']},
 {pais:'Estados Unidos',terminos:['new york times','washington post','cnn','associated press','npr','the verge','techcrunch']},
 {pais:'España',terminos:['el pais','abc espana','la vanguardia','20minutos espana']},
];
const dominios={ar:'Argentina',mx:'México',pe:'Perú',co:'Colombia',cl:'Chile',br:'Brasil',uy:'Uruguay',py:'Paraguay',bo:'Bolivia',ec:'Ecuador',ve:'Venezuela',cr:'Costa Rica',pa:'Panamá',gt:'Guatemala',cu:'Cuba',do:'República Dominicana',hn:'Honduras',ni:'Nicaragua',es:'España',uk:'Reino Unido',fr:'Francia',de:'Alemania',it:'Italia',cn:'China',jp:'Japón',kr:'Corea del Sur',in:'India',au:'Australia',ca:'Canadá',za:'Sudáfrica'};
const mapaPaises=new Map(paises.map(p=>[p.pais,p]));
function coincidencias(s){const t=normalizar(s),out=new Set();if(!t)return out;for(const p of reglas){if(p.regs.some(re=>re.test(t)))out.add(p.pais)}return out;}
function paisDesdeDominio(url){
 try{const u=new URL(url),h=u.hostname.toLowerCase().replace(/^www\./,'');
   // Noticias sindicadas: Google News NO es un medio de un país determinado.
   if(['news.google.com','www.google.com','bing.com','www.bing.com'].includes(h))return null;
   // Infobae se publica en muchos países; sus subrutas explícitas prevalecen.
   if(h.endsWith('infobae.com')){
     const ruta=normalizar(u.pathname);
     for(const [slug,pais] of Object.entries({argentina:'Argentina',mexico:'México',peru:'Perú',colombia:'Colombia',chile:'Chile',america:'',espana:'España'}))if(slug&&ruta.startsWith(`/\u0061merica/${slug}/`)||ruta.startsWith(`/${slug}/`))return pais||null;
     return null;
   }
   const ext=h.split('.').at(-1);return dominios[ext]||null;
 }catch{return null;}
}
function paisDesdeFuente(s){const t=normalizar(s);for(const f of fuentePaises)if(f.terminos.some(x=>reTerm(x).test(t)))return f.pais;return null;}
function resultado(pais,criterio){const p=mapaPaises.get(pais);return p?{pais:p.pais,region:p.region,criterio}:{pais:null,region:null,criterio:'sin_evidencia'};}
/** La descripción puede reflejar resumen periodístico; se evalúa antes que el país de publicación. */
export function clasificarGeografia(n){
 const titulo=coincidencias(n.titulo);
 if(titulo.size===1)return resultado([...titulo][0],'titulo');
 if(titulo.size>1)return {pais:null,region:null,criterio:'ambigua'};
 const resumen=coincidencias(n.resumen);
 if(resumen.size===1)return resultado([...resumen][0],'resumen');
 if(resumen.size>1)return {pais:null,region:null,criterio:'ambigua'};
 // URL con región en la ruta, cuando el publicador organiza por país.
 const directas=coincidencias((()=>{try{return decodeURIComponent(new URL(n.url).pathname).replace(/[-_/]/g,' ')}catch{return''}})());
 if(directas.size===1)return resultado([...directas][0],'url');
 if(directas.size>1)return {pais:null,region:null,criterio:'ambigua'};
 const metadato=coincidencias(n.paisFuente);
 if(metadato.size===1)return resultado([...metadato][0],'pais_fuente');
 const porNombre=paisDesdeFuente(n.fuente);if(porNombre)return resultado(porNombre,'medio');
 const porDominio=paisDesdeDominio(n.urlFuente)||paisDesdeDominio(n.url);
 return porDominio?resultado(porDominio,'dominio'):resultado(null,'sin_evidencia');
}
export function correspondeASeccion(n,seccion){
 if(seccion==='universidades')return true; // académica transversal: no es una región.
 const r=clasificarGeografia(n);
 return r.region===seccion;
}
