import test from 'node:test';import assert from 'node:assert/strict';import {createRng,generateRecords,toCsv,toSql,validateSchema} from '../src/generator.js';
test('seed gera sequência reproduzível',()=>{const a=createRng('x'),b=createRng('x');assert.deepEqual([a(),a(),a()],[b(),b(),b()])});
test('valida nomes e duplicidades',()=>{assert.throws(()=>validateSchema([{name:'1x'}]));assert.throws(()=>validateSchema([{name:'x'},{name:'x'}]))});
test('gera registros dentro do limite',()=>{const rows=generateRecords({schema:[{name:'id',type:'id'},{name:'idade',type:'integer',min:18,max:20}],count:3,seed:'x'});assert.equal(rows.length,3);assert.deepEqual(rows.map(r=>r.id),[1,2,3]);assert.ok(rows.every(r=>r.idade>=18&&r.idade<=20))});
test('exporta CSV e SQL',()=>{const rows=[{id:1,nome:'Ana'},{id:2,nome:"D'Ávila"}];assert.match(toCsv(rows),/"id","nome"/);assert.match(toSql(rows,'pessoas'),/INSERT INTO pessoas/);assert.match(toSql(rows,'pessoas'),/D''Ávila/)})
