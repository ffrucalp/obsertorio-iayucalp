import test from 'node:test';
import assert from 'node:assert/strict';
import { enlaceWhatsApp } from '../compartir.mjs';

test('compartir prepara título y enlace correcto (con acentos y caracteres especiales)', () => {
  const item = { titulo: 'La IA en Psicología: desafíos & oportunidades', url: 'https://ejemplo.org/ia?categoria=salud&x=1' };
  const enlace = enlaceWhatsApp(item);
  const u = new URL(enlace);
  assert.equal(u.origin, 'https://wa.me');
  assert.equal(u.searchParams.get('text'), `${item.titulo}\n${item.url}`);
});

test('no expone notas privadas ni datos de la biblioteca', () => {
  const enlace = enlaceWhatsApp({titulo:'Noticia sobre IA',url:'https://ejemplo.com/nota',nota:'Nota personal privada',guardadoEn:'2026-10-28'});
  assert.ok(enlace);
  assert.ok(!decodeURIComponent(enlace).includes('Nota personal privada'));
});

test('no construye enlaces para URL ausente o peligrosa', () => {
  for(const url of ['javascript:alert(1)', 'file:///etc/passwd', 'data:text/plain,X', '', '/local']){
    assert.equal(enlaceWhatsApp({titulo:'Prueba',url}),null);
  }
  assert.equal(enlaceWhatsApp(null),null);
});

test('admite HTTP y usa título genérico si el titular está ausente', () => {
  const enlace=enlaceWhatsApp({url:'http://ejemplo.org/noticia'});
  assert.equal(new URL(enlace).searchParams.get('text'),'Noticia sobre inteligencia artificial\nhttp://ejemplo.org/noticia');
});
