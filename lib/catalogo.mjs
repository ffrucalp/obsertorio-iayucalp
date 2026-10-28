/** Catálogo temático basado en las facultades y carreras publicadas por UCALP (octubre 2026).
 * Se incluyen disciplinas consolidadas: ciclos y modalidades equivalentes se agrupan para evitar duplicaciones.
 * Los términos de búsqueda son editoriales/orientativos; NO constituyen la currícula oficial.
 */
const carrera = (id, nombre, es, en = es) => ({ id, nombre, es, en });
export const FACULTADES = [
  {
    id: 'derecho', nombre: 'Derecho y Ciencias Políticas', corto: 'Derecho y Política', icono: '⚖',
    descripcion: 'Justicia, instituciones, seguridad y relaciones internacionales.',
    url: 'https://www.ucalp.edu.ar/facultad/derecho-y-ciencias-politicas/',
    carreras: [
      carrera('abogacia','Abogacía','"reforma judicial" OR "derechos humanos" OR legislación','"legal reform" OR "human rights" OR judiciary'),
      carrera('politica','Licenciatura en Ciencia Política y Relaciones Internacionales','"política internacional" OR diplomacia OR "políticas públicas"','"international relations" OR diplomacy OR "public policy"'),
      carrera('criminalistica','Licenciatura en Criminalística','criminalística OR "ciencias forenses" OR "evidencia digital"','forensics OR "crime scene investigation" OR "digital evidence"'),
      carrera('escribania','Escribanía','notariado OR "escritura pública" OR "derecho registral"','notary OR "property law" OR "digital notarization"'),
      carrera('martillero','Martillero y Corredor de Comercio','"mercado inmobiliario" OR subastas OR "corretaje inmobiliario"','"real estate market" OR auctions OR brokerage'),
      carrera('seguridad','Licenciatura en Seguridad','"seguridad pública" OR "prevención del delito" OR "política criminal"','"public safety" OR "crime prevention" OR security policy'),
    ],
  },
  {
    id: 'arquitectura', nombre: 'Arquitectura y Diseño', corto: 'Arquitectura y Diseño', icono: '▥',
    descripcion: 'Urbanismo, sustentabilidad, diseño visual y espacios habitables.',
    url: 'https://www.ucalp.edu.ar/facultad/arquitectura-y-diseno/',
    carreras: [
      carrera('arquitectura','Arquitectura','arquitectura OR urbanismo OR "construcción sustentable"','architecture OR urbanism OR "sustainable buildings"'),
      carrera('interiores','Licenciatura en Diseño de Interiores','"diseño de interiores" OR "arquitectura interior" OR "espacios interiores"','"interior design" OR "interior architecture"'),
      carrera('visual','Licenciatura en Diseño Visual','"diseño gráfico" OR "comunicación visual" OR "diseño digital"','"graphic design" OR "visual communication" OR "digital design"'),
      carrera('tec-arq','Técnico Universitario en Arquitectura','arquitectura OR urbanismo OR "construcción sustentable"','architecture OR urbanism OR "sustainable buildings"'),
    ],
  },
  {
    id: 'economicas', nombre: 'Ciencias Económicas y Sociales', corto: 'Económicas y Sociales', icono: '▤',
    descripcion: 'Economía, empresas, trabajo, marketing y desarrollo social.',
    url: 'https://www.ucalp.edu.ar/facultad/cs-economicas-y-sociales/',
    carreras: [
      carrera('administracion','Licenciatura en Administración de Empresas','"gestión empresarial" OR "administración de empresas" OR "estrategia corporativa"','"business management" OR "corporate strategy"'),
      carrera('economia','Licenciatura en Economía','inflación OR "política económica" OR macroeconomía','inflation OR "economic policy" OR macroeconomics'),
      carrera('contabilidad','Contador Público','"normas contables" OR auditoría OR "información financiera"','"accounting standards" OR auditing OR "financial reporting"'),
      carrera('marketing','Licenciatura en Marketing','marketing OR "comercio electrónico" OR "experiencia del cliente"','marketing OR "ecommerce" OR "customer experience"'),
      carrera('comercializacion','Licenciatura en Comercialización','comercialización OR "gestión comercial" OR "mercado de consumo"','sales management OR commerce OR marketing'),
      carrera('rrpp','Licenciatura en Relaciones Públicas','"comunicación institucional" OR "relaciones públicas" OR reputación','"public relations" OR "corporate communications"'),
      carrera('rrhh','Licenciatura en Gestión de Recursos Humanos','"recursos humanos" OR "futuro del trabajo" OR "talento laboral"','"human resources" OR "future of work" OR "talent management"'),
      carrera('turismo','Licenciatura en Turismo y Hotelería','turismo OR hotelería OR "turismo sostenible"','tourism OR hospitality OR "sustainable tourism"'),
      carrera('negocios','Licenciatura en Negocios Digitales','"negocios digitales" OR fintech OR "economía digital"','"digital business" OR fintech OR "digital economy"'),
      carrera('trabajosocial','Ciclo de Licenciatura en Trabajo Social','"trabajo social" OR "inclusión social" OR pobreza','"social work" OR "social inclusion" OR poverty'),
      carrera('tec-negocios','Técnico Universitario en Negocios Digitales','"negocios digitales" OR fintech OR "economía digital"','"digital business" OR fintech OR "digital economy"'),
      carrera('agencias','Tecnicatura Universitaria en Agencias de Viajes y Turismo','"agencias de viajes" OR turismo OR "turismo digital"','travel agencies OR tourism OR hospitality'),
    ],
  },
  {
    id: 'exactas', nombre: 'Ciencias Exactas e Ingeniería', corto: 'Exactas e Ingeniería', icono: '⌘',
    descripcion: 'Sistemas, datos, ingeniería ambiental, seguridad y tecnología.',
    url: 'https://www.ucalp.edu.ar/facultad/ciencias-exactas-e-ingenieria/',
    carreras: [
      carrera('gobernanza','Licenciatura en Gobernanza de Datos','"gobernanza de datos" OR "calidad de datos" OR "interoperabilidad" OR "protección de datos"','"data governance" OR "data quality" OR "data stewardship" OR "data privacy"'),
      carrera('tec-gobernanza','Técnico Universitario en Gobernanza de Datos','"gobernanza de datos" OR "calidad de datos" OR "interoperabilidad" OR "protección de datos"','"data governance" OR "data quality" OR "data stewardship" OR "data privacy"'),
      carrera('sistemas','Licenciatura en Sistemas','"desarrollo de software" OR "inteligencia artificial" OR ciberseguridad','"software engineering" OR "artificial intelligence" OR cybersecurity'),
      carrera('analista','Analista de Sistemas','"desarrollo de software" OR "programación" OR ciberseguridad','"software engineering" OR coding OR cybersecurity'),
      carrera('ambiental','Ingeniería Ambiental','"impacto ambiental" OR "ingeniería ambiental" OR "gestión ambiental"','"environmental engineering" OR "environmental impact" OR sustainability'),
      carrera('seguridadlaboral','Licenciatura en Seguridad, Salud y Ambiente Laboral','"seguridad laboral" OR "salud ocupacional" OR "prevención de riesgos"','"occupational health" OR "workplace safety" OR "risk prevention"'),
      carrera('tec-seguridadlaboral','Técnico Universitario en Seguridad, Salud y Ambiente Laboral','"seguridad laboral" OR "salud ocupacional" OR "prevención de riesgos"','"occupational health" OR "workplace safety" OR "risk prevention"'),
    ],
  },
  {
    id: 'salud', nombre: 'Ciencias de la Salud', corto: 'Ciencias de la Salud', icono: '✚',
    descripcion: 'Salud pública, rehabilitación, nutrición y bienestar integral.',
    url: 'https://www.ucalp.edu.ar/facultad/ciencias-de-la-salud/',
    carreras: [
      carrera('fonoaudiologia','Licenciatura en Fonoaudiología','fonoaudiología OR audiología OR "trastornos del lenguaje"','"speech therapy" OR audiology OR "language disorders"'),
      carrera('kinesiologia','Licenciatura en Kinesiología y Fisiatría','kinesiología OR fisioterapia OR rehabilitación','physiotherapy OR "physical therapy" OR rehabilitation'),
      carrera('nutricion','Licenciatura en Nutrición','nutrición OR "alimentación saludable" OR "salud alimentaria"','nutrition OR "healthy eating" OR "public health nutrition"'),
      carrera('obstetricia','Licenciatura en Obstetricia','obstetricia OR "salud materna" OR embarazo','obstetrics OR "maternal health" OR pregnancy'),
      carrera('terapia','Licenciatura en Terapia Ocupacional','"terapia ocupacional" OR "rehabilitación funcional" OR discapacidad','"occupational therapy" OR "functional rehabilitation" OR disability'),
      carrera('instrumentacion','Ciclo de Licenciatura en Instrumentación Quirúrgica','"instrumentación quirúrgica" OR "seguridad del paciente" OR "cirugía robótica"','"surgical technology" OR "patient safety" OR "robotic surgery"'),
    ],
  },
  {
    id: 'humanidades', nombre: 'Humanidades', corto: 'Humanidades', icono: '✦',
    descripcion: 'Educación, pensamiento, psicología, comunicación y cultura.',
    url: 'https://www.ucalp.edu.ar/facultad/humanidades/',
    carreras: [
      carrera('educacion','Licenciatura en Ciencias de la Educación','"innovación educativa" OR pedagogía OR "educación superior"','"education research" OR pedagogy OR "higher education"'),
      carrera('psicologia','Licenciatura en Psicología','psicología OR "salud mental" OR "psicología clínica"','psychology OR "mental health" OR "clinical psychology"'),
      carrera('psicopedagogia','Licenciatura en Psicopedagogía','psicopedagogía OR "dificultades de aprendizaje" OR neuroeducación','"learning difficulties" OR "educational psychology"'),
      carrera('filosofia','Licenciatura en Filosofía','filosofía OR bioética OR "ética de la inteligencia artificial"','philosophy OR bioethics OR "AI ethics"'),
      carrera('letras','Licenciatura en Letras','literatura OR lingüística OR "enseñanza de la lengua"','literature OR linguistics OR "language education"'),
      carrera('prof-letras','Profesorado Universitario en Letras','literatura OR lingüística OR "enseñanza de la lengua"','literature OR linguistics OR "language education"'),
      carrera('periodismo','Licenciatura en Periodismo','periodismo OR "libertad de prensa" OR "medios digitales"','journalism OR "press freedom" OR "digital media"'),
      carrera('periodismo-deportivo','Tecnicatura Universitaria en Periodismo Deportivo','"periodismo deportivo" OR deporte OR "medios deportivos"','"sports journalism" OR "sports media"'),
      carrera('educacionfisica','Profesorado en Educación Física','"educación física" OR "actividad física" OR deporte','"physical education" OR sports OR "exercise science"'),
      carrera('lic-educacionfisica','Ciclo de Licenciatura en Educación Física','"educación física" OR "actividad física" OR deporte','"physical education" OR sports OR "exercise science"'),
      carrera('historia','Ciclo de Licenciatura en Historia','historia OR "patrimonio cultural" OR "historia contemporánea"','history OR "cultural heritage" OR "contemporary history"'),
      carrera('geografia','Ciclo de Licenciatura en Geografía','geografía OR "sistemas de información geográfica" OR territorio','geography OR GIS OR geospatial'),
    ],
  },
  {
    id: 'odontologia', nombre: 'Odontología', corto: 'Odontología', icono: '◈',
    descripcion: 'Salud bucodental, investigación clínica y tecnología odontológica.',
    url: 'https://www.ucalp.edu.ar/facultad/odontologia/',
    carreras: [
      carrera('odontologia','Odontología','odontología OR "salud bucal" OR "tratamientos dentales"','dentistry OR "oral health" OR "dental care"'),
      carrera('protesis','Tecnicatura Universitaria en Prótesis Dental','"prótesis dental" OR "implantología dental" OR "laboratorio dental"','"dental prosthetics" OR "dental implants" OR "dental laboratory"'),
      carrera('asistencia','Auxiliar en Asistencia Odontológica','"asistencia odontológica" OR "higiene dental" OR "prevención bucodental"','"dental assisting" OR "dental hygiene" OR "preventive dentistry"'),
    ],
  },
];
export const SECCIONES = {
  argentina: { nombre: 'Argentina', gl:'AR', hl:'es-419', ceid:'AR:es', contexto:'(Argentina OR "Buenos Aires")' },
  latinoamerica: { nombre:'Latinoamérica', gl:'MX',hl:'es-419',ceid:'MX:es',contexto:'("América Latina" OR Latinoamérica OR México OR Colombia OR Chile OR Brasil OR Perú OR Uruguay)' },
  internacional: { nombre:'Internacional', gl:'US',hl:'en-US',ceid:'US:en',contexto:'' },
  universidades: { nombre:'Universidades', gl:'AR',hl:'es-419',ceid:'AR:es',contexto:'(universidad OR universidades OR "educación superior" OR university OR "higher education")' },
};
export const TENDENCIAS = {
  argentina: [
    'educación OR universidad OR docentes OR estudiantes',
    'salud OR medicina OR diagnóstico OR hospitales',
    'empresas OR economía OR trabajo OR gobierno OR regulación',
  ],
  latinoamerica: [
    'educación OR universidad OR investigación',
    'salud OR medicina OR hospitales',
    'empresas OR trabajo OR gobierno OR regulación',
  ],
  internacional: [
    'education OR universities OR research',
    'healthcare OR medicine OR diagnostics',
    'business OR economy OR law OR government',
  ],
  universidades: [
    'enseñanza OR aprendizaje OR estudiantes OR docentes',
    'investigación OR científica OR académico OR research',
    'campus OR facultades OR universidades OR universities',
  ],
};
export function buscarFacultad(id) { return FACULTADES.find(f=>f.id===id) || null; }
export function buscarCarrera(facultad, id) { return facultad?.carreras.find(c=>c.id===id) || null; }
