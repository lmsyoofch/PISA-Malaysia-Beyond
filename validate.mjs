import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {countries,subjects,malaysia,oecd,value} from './dist/data.js';
import {splitDateLine} from './dist/geometry.js';
const assert=(ok,message)=>{if(!ok)throw Error(message)};
for(const file of ['index.html','style.css','app.js','data.js','geometry.js','favicon.svg'])assert(fs.existsSync(`dist/${file}`),`Missing ${file}`);
for(const file of ['app.js','data.js','geometry.js'])execFileSync(process.execPath,['--check',`dist/${file}`]);
assert(new Set(countries.map(c=>c.code)).size===countries.length,'Duplicate country');
assert(countries.length===91,'Expected all 91 systems from the science table');
for(const [subject,count] of Object.entries({science:91,math:87,reading:87,digital:85}))assert(countries.filter(c=>c[subject]!==null).length===count,`Coverage mismatch for ${subject}`);
assert(countries.filter(c=>c.regional).every(c=>c.mapName===null),'Regional scores must not shade a whole country');
assert(countries.filter(c=>c.regional).length===4,'Expected four regional results');
assert(countries.filter(c=>c.caution).length===6,'Sampling flags missing');
assert(malaysia.code==='MYS','Malaysia anchor missing');
for(const c of countries){assert(c.lat>=-90&&c.lat<=90&&c.lng>=-180&&c.lng<=180,`Invalid map position ${c.code}`);for(const s of Object.keys(subjects)){assert(c[s]===null||Number.isFinite(c[s]),`Invalid score ${c.code} ${s}`);assert(Number.isFinite(oecd[s]),'OECD benchmark missing');if(c[s]===null)assert(value(c,s,'gap')===null,'Missing score became zero');}if(c.source)assert(c.source.startsWith('https://'),'Invalid source link');}
assert(value(countries.find(c=>c.code==='SGP'),'science','gap')===141,'Incorrect Singapore gap');
assert(value(countries.find(c=>c.code==='IDN'),'math','gap')===-33,'Incorrect Indonesia gap');
assert(Object.keys(countries.find(c=>c.code==='VNM').changes).length===0,'Vietnam trends must be excluded');
console.log('Validated static assets, JavaScript syntax, country records, missing values and benchmark calculations.');
const fixture=ring=>({type:'Feature',properties:{name:'Date line test'},geometry:{type:'Polygon',coordinates:[ring]}});
const crossing=fixture([[170,60],[-170,60],[-170,70],[170,70],[170,60]]);
const split=splitDateLine(crossing);
assert(split.geometry.coordinates.length===2,'Date line crossing must become two pieces');
for(const polygon of split.geometry.coordinates)for(const ring of polygon)for(let i=1;i<ring.length;i++){
 assert(Math.abs(ring[i][0]-ring[i-1][0])<=180,'World-spanning edge remains');
 assert(ring[i][0]>=-180&&ring[i][0]<=180,'Longitude outside world');
}
const planarArea=ring=>Math.abs(ring.slice(1).reduce((sum,p,i)=>sum+ring[i][0]*p[1]-p[0]*ring[i][1],0)/2);
assert(split.geometry.coordinates.reduce((sum,p)=>sum+planarArea(p[0]),0)===200,'Date line split changed polygon area');
const ordinary=fixture([[100,0],[110,0],[110,10],[100,10],[100,0]]);
assert(JSON.stringify(splitDateLine(ordinary).geometry.coordinates[0])===JSON.stringify(ordinary.geometry.coordinates),'Ordinary country geometry changed');
const seam=splitDateLine(fixture([[179,60],[-180,60],[-180,65],[179,65],[179,60]]));
assert(seam.geometry.coordinates.length===1&&planarArea(seam.geometry.coordinates[0][0])===5,'Exact seam produced a world-spanning sliver');
console.log('Validated date line splitting, preserved polygon area and exact-seam boundaries.');
