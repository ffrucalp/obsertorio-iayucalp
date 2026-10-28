# Observatorio UCALP · Inteligencia Artificial (Versión 5.0)

**Novedad:** búsqueda multifuente para noticias de inteligencia artificial en Argentina, Latinoamérica, Internacional y Universidades, filtradas por facultad y carrera. Conserva la identidad visual azul de UCALP y el logo aportado para el proyecto.

## Poner en marcha en Windows

1. Descomprimí el ZIP en una carpeta nueva.
2. Doble clic sobre `INICIAR_WINDOWS.bat` (Node.js 20+).
3. Abrí `http://localhost:4173`.
4. Dejá la ventana de consola abierta mientras uses la app.

Sin `npm install`, sin base de datos ni API keys. También se puede iniciar con `node server.mjs`.

## De dónde vienen las noticias

El backend consulta y combina cuatro vías complementarias (todas sin claves), y después aplica el filtro **IA + campo disciplinar**:

- Google News RSS, con varias consultas por carrera y búsquedas dirigidas a `lanacion.com.ar`, `clarin.com` e `infobae.com`.
- Bing News RSS, como vía alternativa; puede no responder en determinadas ubicaciones.
- GDELT DOC 2.0, índice internacional con ventana de hasta unos tres meses en el servicio consultado; puede limitar peticiones.
- Feeds RSS públicos publicados por LA NACION, Clarín (Tecnología y Sociedad) e Infobae. Su disponibilidad puede cambiar, y los feeds editoriales no son archivos históricos completos.

La interfaz informa qué vías respondieron y si hubo errores parciales. Los resultados no se inventan cuando un proveedor falla. Incluye enlaces para continuar manualmente la búsqueda en cada diario si no aparece una noticia.

No es posible garantizar que incluya **todas** las noticias de un medio: cada fuente tiene sus propios criterios de indexación, restricciones técnicas y ventanas históricas. Los artículos se muestran enlazados a los medios originales; no se copian los contenidos completos.

### Caso de control: Odontología

Se amplió el vocabulario para reconocer **cepillo de dientes**, **higiene oral**, **cepillo dental**, **toothbrush**, **dentistry**, **CameraJet**, etc. Se incluyó una prueba automatizada para la nota de LA NACION sobre Dyson CameraJet publicada el **2/9/2026**: el filtro disciplinar la acepta y el rango de 90 días la incluye al 28/10/2026. La prueba reproduce un RSS controlado, **no demuestra que esa noticia esté actualmente incluida en los índices externos**.

## Filtros y funciones

- Regiones: Argentina, Latinoamérica, Internacional, Universidades.
- Las siete facultades UCALP y carreras disponibles en el catálogo (agrupación editorial).
- Palabra clave opcional sin desactivar la condición de IA.
- Períodos: 7, 30, 90 (predeterminado), 180 y 365 días, sujetos a cobertura real de cada fuente.
- Medio de publicación: todos, LA NACION, Clarín, Infobae, otros.
- Ordenar; guardar noticias y anotaciones en almacenamiento local del navegador; exportar CSV.

La biblioteca personal mantiene la misma clave local de la versión 2.0 y por eso conserva los favoritos si se ejecuta la app en la misma dirección y navegador.

## Publicar en Netlify

Se incluye `netlify.toml` y `netlify/functions/noticias.mjs`; publicá todo el proyecto, no únicamente `index.html`. La ruta `/api/noticias` necesita una función de servidor. Para publicar desde Git, el directorio del proyecto es la raíz de publicación y `netlify/functions` contiene la función. No se necesitan secretos, pero respetá los límites de tiempo, uso y políticas de proveedores. En un sitio con mucho tráfico convendría usar caché persistente y/o un servicio de noticias con licencia.

## Limitaciones y privacidad

Los términos académicos y la relevancia por disciplina se clasifican automáticamente por título y, cuando existe, descripción. Puede haber falsos positivos y negativos. Las secciones regionales aplican una verificación geográfica aproximada por país detectado en el título, el resumen o, en su defecto, el medio; algunas noticias pueden quedar fuera y la región inferida no constituye verificación del lugar del acontecimiento. La búsqueda externa requiere Internet. No se almacena la actividad del usuario en una base de datos; los favoritos están en `localStorage`.

El proyecto es un prototipo, no un portal institucional oficial. Validar la autorización de uso de marca antes de su publicación.

## Pruebas

Ejecutar `npm test` o `node --test`. Son tests locales con proveedores simulados. No fue posible verificar la disponibilidad de RSS, GDELT y Bing en vivo desde el entorno donde se generó el ZIP.


## Versión 4.0: desde el 1 de enero de 2026
- El filtro inicial `Desde 01/01/2026` solicita publicaciones desde esa fecha hasta hoy.
- Para este rango, Google News RSS se consulta por ventanas trimestrales con búsquedas breves para reducir omisiones por el límite de resultados.
- Se muestran diagnósticos de entradas recibidas y descartes por fecha, IA, disciplina o texto.
- Importante: este filtro **no recupera todo el archivo de los periódicos**; depende de los feeds y su indexación y pueden faltar resultados.
- Google News RSS es un feed sin garantías de servicio ni licencia institucional de redistribución. Antes de ofrecerlo como servicio oficial, verificar los términos de cada fuente o contratar proveedores de datos autorizados.


## Versión 5.0: separación geográfica estricta

Los filtros **facultad/carrera y período** permanecen al cambiar entre Argentina, Latinoamérica, Internacional y Universidades. Para las tres primeras secciones, el motor ya no interpreta `gl=AR` (la edición regional de Google) como prueba de que una noticia es argentina.

Se infiere el país del **titular**, después de la **descripción** y, cuando no hay mención del lugar del hecho, por el **medio de publicación** o su dominio. Las señales de noticia tienen prioridad sobre las del medio: una noticia mexicana publicada por un medio argentino no se clasifica como argentina si el título menciona México o Morelos.

- **Argentina:** noticias atribuidas a Argentina.
- **Latinoamérica:** noticias de otros países latinoamericanos; excluye Argentina para evitar duplicados entre secciones.
- **Internacional:** noticias atribuidas a países de fuera de Latinoamérica.
- **Universidades:** sección transversal sin filtro territorial; mantiene los filtros académicos.

Se informa cuántos artículos fueron descartados por país incorrecto o por falta de información geográfica. Esto es **una clasificación heurística**, no una verificación de lugar de los hechos: algunas noticias pertinentes quedarán excluidas (por ejemplo, cuando el medio o el titular no permite deducir país). Un medio argentino puede publicar novedades extranjeras sin mencionarlo, que podrían clasificarse según el medio. Para mejorar la precisión institucional a futuro haría falta análisis del contenido completo y/o metadatos editoriales del país del acontecimiento.

## Compartir noticias por WhatsApp

Cada noticia dispone del enlace **WhatsApp** junto a «Guardar», tanto en los resultados como en «Mi biblioteca». Abre WhatsApp o WhatsApp Web en una nueva pestaña con el **título y la URL de la noticia** preparados; el envío solo se efectúa si la persona confirma el mensaje. No incluye notas personales ni datos guardados en el navegador.
