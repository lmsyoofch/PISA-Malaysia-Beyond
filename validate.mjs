import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {countries,subjects,malaysia,oecd,value} from './dist/data.js';
const assert=(ok,message)=>{if(!ok)throw Error(message)};
for(const file of ['index.html','style.css','app.js','data.js','favicon.svg'])assert(fs.existsSync(`dist/${file}`),`Missing ${file}`);
for(const file of ['app.js','data.js'])execFileSync(process.execPath,['--check',`dist/${file}`]);
assert(new Set(countries.map(c=>c.code)).size===countries.length,'Duplicate country');
assert(malaysia.code==='MYS','Malaysia anchor missing');
for(const c of countries){assert(c.lat>=-90&&c.lat<=90&&c.lng>=-180&&c.lng<=180,`Invalid map position ${c.code}`);for(const s of Object.keys(subjects)){assert(c[s]===null||Number.isFinite(c[s]),`Invalid score ${c.code} ${s}`);assert(Number.isFinite(oecd[s]),'OECD benchmark missing');if(c[s]===null)assert(value(c,s,'gap')===null,'Missing score became zero');}if(c.source)assert(c.source.startsWith('https://'),'Invalid source link');}
assert(value(countries.find(c=>c.code==='SGP'),'science','gap')===141,'Incorrect Singapore gap');
assert(value(countries.find(c=>c.code==='IDN'),'math','gap')===-33,'Incorrect Indonesia gap');
assert(Object.keys(countries.find(c=>c.code==='VNM').changes).length===0,'Vietnam trends must be excluded');
console.log('Validated static assets, JavaScript syntax, country records, missing values and benchmark calculations.');
