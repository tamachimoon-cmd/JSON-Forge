import { createHash, randomUUID } from 'node:crypto';

const FIRST = ['Ana','Bruno','Carla','Diego','Elisa','Felipe','Gabi','Hugo','Iara','João'];
const LAST = ['Silva','Souza','Oliveira','Costa','Lima','Rocha','Mendes','Alves','Ribeiro','Barbosa'];
const CITIES = ['São Paulo','Rio de Janeiro','Belo Horizonte','Curitiba','Recife','Salvador','Fortaleza','Goiânia'];
const DOMAINS = ['example.com','mail.test','dev.local'];

export function createRng(seed='json-forge') {
  let state = Number.parseInt(createHash('sha256').update(String(seed)).digest('hex').slice(0,8),16) >>> 0;
  return () => { state += 0x6D2B79F5; let t=state; t=Math.imul(t^(t>>>15),t|1); t^=t+Math.imul(t^(t>>>7),t|61); return ((t^(t>>>14))>>>0)/4294967296; };
}
const pick=(items,rng)=>items[Math.floor(rng()*items.length)];
const slug=value=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'.').replace(/^\.|\.$/g,'');

function valueFor(field,index,rng){
  const type=field.type??'string'; const name=field.name??`field_${index+1}`;
  switch(type){
    case'id':return index+1;
    case'uuid':return randomUUID();
    case'fullName':return `${pick(FIRST,rng)} ${pick(LAST,rng)}`;
    case'firstName':return pick(FIRST,rng);
    case'lastName':return pick(LAST,rng);
    case'email':{const first=pick(FIRST,rng),last=pick(LAST,rng);return `${slug(`${first}.${last}`)}${index+1}@${pick(DOMAINS,rng)}`;}
    case'city':return pick(CITIES,rng);
    case'integer':{const min=Number(field.min??0),max=Number(field.max??100);return Math.floor(rng()*(max-min+1))+min;}
    case'decimal':{const min=Number(field.min??0),max=Number(field.max??100);return Number((min+rng()*(max-min)).toFixed(Number(field.precision??2)));}
    case'boolean':return rng()>=.5;
    case'date':{const start=new Date(field.start??'2020-01-01').getTime(),end=new Date(field.end??'2030-12-31').getTime();return new Date(start+rng()*(end-start)).toISOString().slice(0,10);}
    case'enum':return pick(Array.isArray(field.values)&&field.values.length?field.values:['ativo','inativo'],rng);
    default:return `${field.prefix??name}-${index+1}`;
  }
}

export function validateSchema(schema){
  if(!Array.isArray(schema)||!schema.length)throw new TypeError('Inclua ao menos um campo.');
  const names=new Set();
  for(const field of schema){
    if(!field||typeof field.name!=='string'||!/^[A-Za-z_][A-Za-z0-9_]*$/.test(field.name))throw new TypeError('Cada campo precisa de um nome válido.');
    if(names.has(field.name))throw new TypeError(`Campo duplicado: ${field.name}`);
    names.add(field.name);
  }
  return true;
}
export function generateRecords({schema,count=10,seed='json-forge'}){validateSchema(schema);const total=Math.min(Math.max(Number.parseInt(count,10)||1,1),1000),rng=createRng(seed);return Array.from({length:total},(_,index)=>Object.fromEntries(schema.map(field=>[field.name,valueFor(field,index,rng)])));}
export function toCsv(records){if(!records.length)return'';const headers=Object.keys(records[0]),esc=value=>`"${String(value??'').replaceAll('"','""')}"`;return[headers.map(esc).join(','),...records.map(record=>headers.map(header=>esc(record[header])).join(','))].join('\n');}
export function toSql(records,table='mock_data'){if(!records.length)return'';const safe=/^[A-Za-z_][A-Za-z0-9_]*$/.test(table)?table:'mock_data',columns=Object.keys(records[0]),value=item=>item===null?'NULL':typeof item==='number'?String(item):typeof item==='boolean'?(item?'TRUE':'FALSE'):`'${String(item).replaceAll("'","''")}'`;return`INSERT INTO ${safe} (${columns.join(', ')}) VALUES\n${records.map(record=>`  (${columns.map(column=>value(record[column])).join(', ')})`).join(',\n')};`;}
