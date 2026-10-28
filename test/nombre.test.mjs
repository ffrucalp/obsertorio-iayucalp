import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
test('nombre visible y pestana del navegador',()=>{
  assert.match(html,/<title>Monitor de Noticias de IA \| UCALP<\/title>/);
  assert.match(html,/<strong>Monitor <em>de Noticias<\/em><\/strong>/);
  assert.match(html,/MONITOR DE NOTICIAS/);
  assert.doesNotMatch(html,/Observatorio/i);
});
test('biblioteca y compartir intactos',()=>{
  assert.match(app,/ucalp-observatorio-biblioteca-ia-v\d/);
  assert.match(app,/WhatsApp/);
  assert.match(html,/id="disciplinas-sidebar"/);
  assert.match(html,/id="secciones"/);
});
