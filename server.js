import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateRecords, toCsv, toSql } from './src/generator.js';

const root=path.dirname(fileURLToPath(import.meta.url));
const publicDir=path.join(root,'public');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8'};
const json=(res,status,data)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'});res.end(JSON.stringify(data));};
async function body(req){const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>128000)throw new Error('Payload excede 128 KB.');chunks.push(chunk);}try{return JSON.parse(Buffer.concat(chunks).toString('utf8')||'{}');}catch{throw new Error('JSON inválido.');}}
export function createServer(){return http.createServer(async(req,res)=>{const url=new URL(req.url,'http://localhost');try{
  if(req.method==='GET'&&url.pathname==='/api/health')return json(res,200,{status:'ok',version:'0.1.0'});
  if(req.method==='POST'&&url.pathname==='/api/generate'){const payload=await body(req),records=generateRecords(payload),format=payload.format??'json';if(format==='csv')return json(res,201,{format,content:toCsv(records),records});if(format==='sql')return json(res,201,{format,content:toSql(records,payload.table),records});return json(res,201,{format:'json',content:JSON.stringify(records,null,2),records});}
  if(req.method==='GET'){const relative=url.pathname==='/'?'index.html':url.pathname.slice(1),file=path.join(publicDir,path.normalize(relative));if(file.startsWith(publicDir)){try{const data=await fs.readFile(file);res.writeHead(200,{'content-type':types[path.extname(file)]??'application/octet-stream'});return res.end(data);}catch{}}}
  return json(res,404,{error:'Rota não encontrada.'});
}catch(error){return json(res,400,{error:error.message});}});}
if(process.argv[1]===fileURLToPath(import.meta.url)){const port=Number(process.env.PORT??3000);createServer().listen(port,'0.0.0.0',()=>console.log(`JSON Forge em http://localhost:${port}`));}
