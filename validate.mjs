import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {countries,subjects,malaysia,oecd,value} from './dist/data.js';
import {splitDateLine} from './dist/geometry.js';
const assert=(ok,message)=>{if(!ok)throw Error(message)};
for(const file of ['index.html','style.css','app.js','data.js','geometry.js','favicon.svg','og.png'])assert(fs.existsSync(`dist/${file}`),`Missing ${file}`);
const og=fs.readFileSync('dist/og.png');
assert(og.length>10000 && og[0]===0x89 && og[1]===0x50 && og[2]===0x4e && og[3]===0x47,'Social preview image is not a valid PNG');
const indexHtml=fs.readFileSync('dist/index.html','utf8');
assert(indexHtml.includes('property="og:image"') && indexHtml.includes('summary_large_image'),'Missing social preview metadata');
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
const {regions,regionOf,members,pageOf,quests,walkRoute}=await import('./dist/world-model.js');
for(const f of ['compare.html','world.css','world.js','world-model.js','vendor/three.module.js','vendor/THREE-LICENSE.txt'])assert(fs.existsSync('dist/'+f),'Missing world asset '+f);
for(const f of ['world.js','world-model.js'])execFileSync(process.execPath,['--check','dist/'+f]);
assert(Object.keys(regions).flatMap(members).length===91,'Regional directory must cover every country');
for(const c of countries)assert(members(regionOf(c)).slice(pageOf(c)*8,pageOf(c)*8+8).some(x=>x.code===c.code),'Country unreachable '+c.code);
assert(quests[0].test(new Set(['MYS','SGP','THA'])),'Neighbour quest fails');
assert(!quests[0].test(new Set(['MYS','SGP'])),'Neighbour quest completes too early');
assert(quests[1].test(new Set(['PHL']),new Set(['PHL'])),'Significant improvement quest fails');
assert(!quests[1].test(new Set(['MYS']),new Set(['MYS'])),'Non-significant change incorrectly accepted');
assert(quests[2].test(new Set(['MYS','JPN','EST'])),'Regional exploration quest fails');
const pavilionPositions=Array.from({length:8},(_,i)=>({x:i%2===0?-11:11,z:-14+Math.floor(i/2)*9}));
const blocked=(x,z)=>Math.hypot(x,z)>23||Math.hypot(x,z-8)<1.7||Math.hypot(x,z+5)<2.5||pavilionPositions.some(p=>Math.abs(x-p.x)<2.8&&Math.abs(z-p.z)<2.3);
for(const start of [{x:0,z:5},...pavilionPositions.map(p=>({x:p.x,z:p.z+3}))])for(const p of pavilionPositions){
 const route=walkRoute(start,{x:p.x,z:p.z+3},blocked);assert(route.length>0,'Pavilion has no walking route');
 for(let i=1;i<route.length;i++){const a=route[i-1],b=route[i],steps=Math.max(Math.abs(b[0]-a[0]),Math.abs(b[1]-a[1]))*4;
 for(let j=0;j<=steps;j++){const t=steps?j/steps:0;assert(!blocked(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t),'Walking route crosses an obstacle');}}
}
console.log('Validated all 91 world destinations, discovery quests and walking routes between all pavilion entrances.');

execFileSync(process.execPath,['--check','dist/comparison-game.js']);
const {closestCountries}=await import('./dist/comparison-game.js');
assert(closestCountries([malaysia,{code:'A',science:null}], 'science').length===0,'Missing score entered prediction');
assert(closestCountries([malaysia,{code:'A',science:malaysia.science-3},{code:'B',science:malaysia.science+3}], 'science').length===2,'Prediction must accept tied answers');
assert(closestCountries([malaysia,{code:'A',science:malaysia.science},{code:'B',science:500}], 'science')[0]==='A','Equal score prediction is wrong');
assert(walkRoute({x:-11,z:-11},{x:0,z:10},blocked).length>0,'Courtyard is unreachable');
console.log('Validated courtyard access and predictions with ties, equal scores and missing values.');
