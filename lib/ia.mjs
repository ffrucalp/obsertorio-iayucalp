/** Relevancia editorial: solo se muestran titulares o descripciones con evidencia explícita de IA.
 * No se trata de una clasificación semántica perfecta ni de una validación periodística.
 */
const normalizar = s => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
const conBordes=(texto,palabra)=>(' '+texto+' ').includes(' '+normalizar(palabra)+' ');
const contiene=(texto,palabra)=>{ const t=normalizar(texto), p=normalizar(palabra);if(p.length<2)return false;
  if(conBordes(t,p))return true;
  // Los temas usan también raíces inequívocas: odontolog -> odontología/odontológico.
  return !p.includes(' ') && p.length>=4 && t.split(' ').some(w=>w.startsWith(p));
};
export const TERMINOS_IA = [
  'inteligencia artificial','artificial intelligence','IA generativa','generative AI','generative artificial intelligence',
  'machine learning','aprendizaje automatico','aprendizaje profundo','deep learning','modelos de lenguaje',
  'large language model','large language models','modelo de lenguaje','red neuronal','redes neuronales','neural network',
  'algoritmo de IA','algoritmos de IA','AI algorithm','AI algorithms','AI-powered','AI driven','AI-enabled',
  'inteligencia artificial generativa','computer vision','vision por computadora','aprendizaje por refuerzo',
  'ChatGPT','OpenAI','DeepSeek','GPT-5','GPT-6','LLM','LLMs','GenAI','Copilot AI','Google Gemini AI','Claude AI',
  'inteligencia artificial aplicada', 'inteligencias artificiales', 'vision artificial', 'computer vision', 'algoritmo de aprendizaje automatico'
];
// Unas pocas siglas son válidas solo como palabra aislada (evitar falsos positivos en palabras como "familia").
export function esNoticiaIA(item){
  const txt=[item.titulo,item.resumen].filter(Boolean).join(' ');
  const n=normalizar(txt);
  return /(?:^| )ia(?: |$)|(?:^| )ai(?: |$)/.test(n) || TERMINOS_IA.some(t=>contiene(txt,t));
}
// Pistas de tema complementarias para que el enlace IA + carrera no dependa únicamente del nombre del título.
// Cada campo corresponde al id declarado en el catálogo académico.
const PISTAS = {
  abogacia:['derecho','legal','ley','regulacion','regulation','legislacion','legislation','juridic','judicial','justicia','tribunal','juez','abogado','copyright','propiedad intelectual','legaltech'],
  politica:['politica','political','eleccion','election','gobierno','government','democracia','diplomacia','public policy','politicas publicas','geopolitica'],
  criminalistica:['criminal','forens','delito','crime','policia','police','evidencia','evidence','investigacion penal','investigation'],
  escribania:['notar','escritura publica','registro de la propiedad','documentos legales','digital signature','documento publico','escribano'],
  martillero:['inmobiliari','real estate','subasta','auction','propiedad','vivienda','housing','tasacion','valuacion'],
  seguridad:['seguridad publica','public safety','policia','police','delito','crime','vigilancia','surveillance','prevencion del delito'],
  arquitectura:['arquitect','architecture','urban','edificio','building','construccion','construction','bim','ciudades','smart cities'],
  interiores:['interior','espacio','spaces','ambientacion','decoracion','furniture','mobiliario'],
  visual:['diseno','design','grafico','graphic','imagen','image','ilustracion','illustration','arte visual','visual art','branding'],
  'tec-arq':['arquitect','architecture','urban','edificio','building','construccion','construction','bim'],
  administracion:['empresa','business','organizacion','organization','management','gestion empresarial','productividad','productivity'],
  economia:['econom','inflacion','inflation','macroeconom','mercados','markets','finanz','finance','crecimiento economico'],
  contabilidad:['contabil','accounting','auditoria','audit','impuestos','tax','facturacion','financial reporting','balance'],
  marketing:['marketing','publicidad','advertising','consumidor','consumer','marca','brands','campana','campaign'],
  comercializacion:['ventas','sales','retail','comercio','commerce','ecommerce','comercial','consumidor'],
  rrpp:['relaciones publicas','public relations','comunicacion institucional','corporate communications','reputacion','reputation'],
  rrhh:['recursos humanos','human resources','empleo','employment','contratacion','hiring','talento','talent','trabajadores','workforce'],
  turismo:['turismo','tourism','hotel','hospitality','viajes','travel','destino','destination'],
  negocios:['negocios digitales','digital business','fintech','comercio electronico','ecommerce','startup','banca digital'],
  trabajosocial:['trabajo social','social work','pobreza','poverty','inclusion social','inclusion','vulnerabilidad','desigualdad'],
  'tec-negocios':['negocios digitales','digital business','fintech','comercio electronico','ecommerce','startup'],
  agencias:['turismo','tourism','hotel','travel','agencia de viajes','trip','viajes'],
  gobernanza:['gobernanza de datos','data governance','calidad de datos','data quality','privacidad','privacy','proteccion de datos','data protection','interoperabilidad','interoperability','responsabilidad algoritmica','algorithmic accountability','sesgo','bias','auditoria algoritmica','ai audit','gobernanza de ia','ai governance','regulacion de ia','ai regulation','cumplimiento','compliance','gestion de datos','data management'],
  'tec-gobernanza':['gobernanza de datos','data governance','calidad de datos','data quality','privacidad','privacy','proteccion de datos','data protection','interoperabilidad','interoperability','responsabilidad algoritmica','algorithmic accountability','sesgo','bias','auditoria algoritmica','ai audit','gobernanza de ia','ai governance','regulacion de ia','ai regulation','cumplimiento','compliance','gestion de datos','data management'],
  sistemas:['software','programacion','programming','desarrollador','developer','codigo','coding','ciberseguridad','cybersecurity','sistemas','systems','aplicacion','application','agentes de ia','ai agents','machine learning','modelos de lenguaje','llm'],
  analista:['software','programacion','programming','codigo','coding','sistemas','systems','ciberseguridad','cybersecurity','analista','analyst','aplicaciones','applications'],
  ambiental:['ambient','environment','clima','climate','sostenib','sustainab','contaminacion','pollution','biodiversidad','biodiversity','energia verde'],
  seguridadlaboral:['seguridad laboral','workplace safety','salud ocupacional','occupational health','accidentes laborales','riesgos laborales','worker safety','prevencion de riesgos'],
  'tec-seguridadlaboral':['seguridad laboral','workplace safety','salud ocupacional','occupational health','accidentes laborales','riesgos laborales','worker safety'],
  fonoaudiologia:['fonoaudi','speech therapy','audiolog','lenguaje','language disorders','audicion','hearing','voz','speech'],
  kinesiologia:['kinesiolog','fisio','physiotherapy','physical therapy','rehabilit','movilidad','mobility'],
  nutricion:['nutric','nutrition','alimentacion','alimentos','diet','food','obesidad','obesity'],
  obstetricia:['obstetric','matern','embarazo','pregnancy','prenatal','parto','birth','gestacion'],
  terapia:['terapia ocupacional','occupational therapy','rehabilit','discapacidad','disability','autonomia funcional'],
  instrumentacion:['cirugia','surgery','surgical','quirofano','operating room','instrumentacion quirurgica','robotic surgery','cirugia robotica'],
  educacion:['educacion','education','docente','teacher','aula','classroom','aprendizaje','learning','pedagog','universidad','university'],
  psicologia:['psicolog','psycholog','salud mental','mental health','psiquiatr','psychiatr','terapia','therapy','emociones','emotion'],
  psicopedagogia:['psicopedagog','learning disabilities','dificultades de aprendizaje','neuroeducacion','educational psychology','trastornos del aprendizaje','learning difficulties'],
  filosofia:['filosof','philosoph','etica','ethics','moral','bioetica','bioethics','humanismo','humanism','conciencia','consciousness','sentiencia','sentience'],
  letras:['literatura','literature','escritura','writing','linguist','lengua','language','texto','text','traduccion','translation'],
  'prof-letras':['literatura','literature','escritura','writing','linguist','lengua','language','texto','text','traduccion','translation'],
  periodismo:['periodis','journalis','prensa','press','medios','media','noticias','news','desinformacion','disinformation'],
  'periodismo-deportivo':['periodismo deportivo','sports journalism','deporte','sports media','sports news','noticias deportivas'],
  educacionfisica:['educacion fisica','physical education','deporte','sports','entrenamiento','training','actividad fisica','fitness'],
  'lic-educacionfisica':['educacion fisica','physical education','deporte','sports','entrenamiento','training','actividad fisica','fitness'],
  historia:['historia','history','historico','historical','patrimonio','heritage','archivos','archives','arqueologia'],
  geografia:['geografia','geography','geoespacial','geospatial','satellite','satelital','gis','territorio','mapas','mapping'],
  odontologia:['odontolog','dental','dentist','dentistry','oral health','salud bucal','dientes','teeth','cepillo de dientes','cepillo dental','cepillado','toothbrush','toothbrushing','higiene oral','higiene bucal','limpieza interdental','interdental','ortodoncia','CameraJet'],
  protesis:['protesis dental','dental prosthe','implant','laboratorio dental','dental lab','ortodoncia','dentadura','dental imaging','impresion dental','dental printing'],
  asistencia:['asistencia odontologica','dental assist','higiene dental','dental hygiene','salud bucal','oral health','odontolog','dental','cepillo de dientes','cepillo dental','toothbrush','higiene oral'],
};
// Arquitectura de edificios y urbanismo ≠ arquitectura de software, datos o sistemas.
// La evidencia edilicia explícita prevalece si una noticia menciona ambos campos.
const ARQ_EDILICIA=[
  'edificio','building','construccion','construction','urbanismo','urban planning','urban design',
  'bim','revit','archicad','fachada','facade','vivienda','housing',
  'arquitectura sostenible','arquitectura bioclimatica','arquitectura residencial',
  'arquitectura edilicia','diseno arquitectonico','architectural design',
  'proyecto arquitectonico','architectural project','planos arquitectonicos',
  'obra arquitectonica','obras arquitectonicas','edificacion','skyscraper',
  'ciudades inteligentes','smart cities','paisajismo','landscape architecture',
  'arquitectura y diseno','arquitectura y construccion','architecture and design',
  'architecture and construction','arquitectura e interiorismo','interior architecture'
];
const ARQ_TECNICA=[
  /\barquitectura (?:de|del|para|en) (?:datos|software|sistemas|redes|nube|microservicios|informacion|ia|inteligencia artificial|computacion|computadoras|procesadores|chips|modelos|plataformas|aplicaciones|bases de datos)\b/,
  /\b(?:data|software|system|network|cloud|ai|information|computer|processor|chip|database|microservice) architecture\b/,
  /\barquitectura (?:digital|tecnologica|informatica|computacional)\b/,
  /\barquitecturas? (?:neuronales|de redes neuronales)\b/,
  /\barquitectos? de (?:datos|software|soluciones|sistemas|redes|plataformas)\b/,
  /\b(?:data|software|cloud|system|network) architects?\b/
];
export function esArquitecturaEdilicia(item){
  const texto=[item.titulo,item.resumen].filter(Boolean).join(' ');
  if(ARQ_EDILICIA.some(p=>contiene(texto,p)))return true;
  const n=normalizar(texto);
  if(ARQ_TECNICA.some(p=>p.test(n)))return false;
  return /\b(?:arquitectura|architecture|architectural|arquitectos?|architects?)\b/.test(n);
}
export function esNoticiaDeDisciplina(item,facultad,carrera){
  if(!facultad)return true;
  const texto=[item.titulo,item.resumen].filter(Boolean).join(' ');
  const carreras=carrera?[carrera]:facultad.carreras;
  return carreras.some(c=>{
    if(c.id==='arquitectura'||c.id==='tec-arq')return esArquitecturaEdilicia(item);
    const pistas=PISTAS[c.id]||[];
    return pistas.some(p=>contiene(texto,p));
  });
}
export function verificacionTematica(item,facultad,carrera){return esNoticiaIA(item)&&esNoticiaDeDisciplina(item,facultad,carrera);}
