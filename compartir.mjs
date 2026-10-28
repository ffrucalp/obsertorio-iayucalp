/** Construye el enlace de WhatsApp con el título y la URL pública de la noticia. */
export function enlaceWhatsApp(item) {
  if (!item || !item.url) return null;
  let url;
  try {
    url = new URL(String(item.url));
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  const titulo = String(item.titulo || 'Noticia sobre inteligencia artificial').trim();
  const mensaje = `${titulo}\n${url.href}`;
  return 'https://wa.me/?text=' + encodeURIComponent(mensaje);
}
