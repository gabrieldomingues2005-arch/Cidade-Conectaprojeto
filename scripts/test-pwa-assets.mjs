import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const manifest=JSON.parse(fs.readFileSync('manifest.webmanifest','utf8'));
test('manifest usa PNGs reais nos tamanhos declarados e ícone maskable separado',()=>{for(const icon of manifest.icons){const b=fs.readFileSync(icon.src);assert.equal(b.subarray(1,4).toString(),'PNG');const [w,h]=icon.sizes.split('x').map(Number);assert.equal(b.readUInt32BE(16),w);assert.equal(b.readUInt32BE(20),h)}assert.ok(manifest.icons.some(i=>i.sizes==='192x192'));assert.ok(manifest.icons.some(i=>i.sizes==='512x512'&&i.purpose==='maskable'))});
test('atalhos PWA não contêm token nem localização de usuário',()=>{for(const shortcut of manifest.shortcuts){assert.ok(['./#/registrar','./#/acompanhar','./#/minhas','./#/mapa','./#/noticias'].includes(shortcut.url));assert.ok(!/[?&]/.test(shortcut.url))}assert.equal(manifest.display,'standalone')});

test('manifest oferece atalho de acompanhamento sem parâmetros sensíveis',()=>{assert.ok(manifest.shortcuts.some(s=>s.url==='./#/acompanhar'));});
