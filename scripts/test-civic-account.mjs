import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync('assets/civic-account.js','utf8');
test('conta cidadã usa sessão separada e nunca armazena senha',()=>{
 assert.match(source,/cidadeConectaCitizenAccountSessionV1/);
 assert.match(source,/sessionStorage/);
 assert.doesNotMatch(source,/localStorage/);
 assert.doesNotMatch(source,/setItem\([^\n]*password/i);
});
test('conta cidadã só chama projeto oficial e Edge dedicada',()=>{
 assert.match(source,/qzpofoxxrjunyayczcfu/);
 assert.match(source,/functions\/v1\/citizen-account/);
 assert.doesNotMatch(source,/htzigdvatjpvvkwswjof/);
});
test('login continua opcional e sincronização é explícita',()=>{
 assert.match(source,/sync_local/);
 assert.match(source,/syncLocal/);
 assert.match(source,/signIn/);
 assert.match(source,/signUp/);
});

test('conta DEMO fica isolada em sessionStorage e entra antes de qualquer autenticação remota',()=>{
 assert.match(source,/cidadeConectaDemoCitizenSessionV1/);
 assert.match(source,/cidadeConectaDemoCitizenStateV1/);
 assert.match(source,/state\.demo/);
 assert.match(source,/resetDemo/);
 const demoBranch=source.indexOf("if(demo&&normalized===");
 const remoteLogin=source.indexOf("auth('token?grant_type=password'");
 assert.ok(demoBranch>=0&&remoteLogin>demoBranch,'login DEMO deve ser resolvido antes do Auth remoto');
});
test('operações DEMO não chamam a Edge Function cidadã',()=>{
 assert.match(source,/if\(state\.demo\)throw Error\('A conta DEMO não envia alterações ao servidor\.'/);
 assert.match(source,/if\(state\.demo\)\{const list=new Set\(state\.follows\)/);
 assert.match(source,/if\(state\.demo\)\{state\.notifications=/);
});

test('script DEMO carrega antes da conta para restaurar sessão fictícia após F5',()=>{
 const html=readFileSync('index.html','utf8');
 const demo=html.indexOf('assets/civic-demo.js');
 const account=html.indexOf('assets/civic-account.js');
 assert.ok(demo>=0&&account>demo,'civic-demo.js precisa carregar antes de civic-account.js');
});
