import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync('index.html','utf8'),source=readFileSync('assets/map-resilience.js','utf8'),sw=readFileSync('sw.js','utf8');
test('Leaflet possui CDN primário, fallback secundário e fallback vetorial local',()=>{
 assert.match(html,/unpkg\.com\/leaflet@1\.9\.4/);
 assert.match(html,/cdn\.jsdelivr\.net\/npm\/leaflet@1\.9\.4/);
 assert.match(html,/assets\/map-resilience\.js/);
 assert.match(source,/tileerror/);
 assert.match(source,/failures>=8/);
 assert.match(source,/map\.removeLayer\(layer\)/);
 assert.match(source,/Os pontos, filtros e camadas do Cidade Conecta continuam disponíveis/);
});
test('resiliência cartográfica não acessa dados sensíveis nem geolocalização',()=>{
 assert.doesNotMatch(source,/geolocation|occurrence_contacts|private_location|tracking_token|exact/i);
 assert.match(source,/cidadeconecta:map-tiles-degraded/);
});
test('PWA cacheia o módulo local de resiliência',()=>{
 assert.match(sw,/\.\/assets\/map-resilience\.js/);
 assert.match(sw,/\.\/assets\/map-resilience\.js\?v=1\.0\.1/);
});

test('wrapper tolera tile layer parcial sem addTo',()=>{assert.match(source,/typeof layer\.addTo===\'function\'/);assert.match(source,/originalAdd\?originalAdd\(m\):layer/);});
