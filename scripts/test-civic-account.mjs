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
