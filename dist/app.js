import {countries,subjects,malaysia,oecd,value,format,signed,colour} from './data.js';
const $=id=>document.getElementById(id);
const state={subject:'science',mode:'score',region:'sea',selected:malaysia,sort:'score'};
let mapSvg,mapRoot,mapProjection,mapPath,mapZoom,features=[];
const countryLayers=new Map();
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const visible=()=>countries.filter(c=>state.region==='global'||c.region==='sea');
const countryFor=f=>countries.find(c=>!c.regional&&(c.mapName===f.properties.name||(c.code==='MKD'&&f.properties.name==='Macedonia')||(c.code==='CZE'&&f.properties.name==='Czech Republic')));
const active=c=>c&&(state.region==='global'||c.region==='sea');
const gapText=n=>n===null?'No verified score for this subject':n===0?'Same mean score as Malaysia':`${Math.abs(n)} points ${n>0?'above':'below'} Malaysia`;
const trend=c=>c.changes[state.subject]==null?'Not available':`${signed(c.changes[state.subject])}${c.ns.includes(state.subject)?'†':''}`;
function select(c,fly=true){state.selected=c;if(c.region!=='sea'&&state.region==='sea')state.region='global';render();if(mapSvg&&fly)zoomToCountry(c);}
function mapSize(){const el=$('map');return [Math.max(320,el.clientWidth),Math.max(320,el.clientHeight)];}
function resetProjection(){if(!mapSvg)return;const [w,h]=mapSize();mapSvg.attr('viewBox',`0 0 ${w} ${h}`);mapProjection=d3.geoNaturalEarth1().fitExtent([[12,12],[w-12,h-12]],{type:'Sphere'});mapPath=d3.geoPath(mapProjection);if(mapRoot){mapRoot.selectAll('path.country').attr('d',mapPath);mapRoot.selectAll('circle.map-point').attr('cx',d=>mapProjection([d.lng,d.lat])?.[0]??-99).attr('cy',d=>mapProjection([d.lng,d.lat])?.[1]??-99);}}
function fit(){if(!mapSvg||!mapZoom)return;const [w,h]=mapSize();let t=d3.zoomIdentity;if(state.region==='sea'){const pts=[[91,-13],[142,26]].map(([lng,lat])=>mapProjection([lng,lat]));const x0=Math.min(pts[0][0],pts[1][0]),x1=Math.max(pts[0][0],pts[1][0]),y0=Math.min(pts[0][1],pts[1][1]),y1=Math.max(pts[0][1],pts[1][1]);const k=Math.min(7,.88/Math.max((x1-x0)/w,(y1-y0)/h));t=d3.zoomIdentity.translate(w/2,h/2).scale(k).translate(-(x0+x1)/2,-(y0+y1)/2);}mapSvg.call(mapZoom.transform,t);}
function zoomToCountry(c){if(!mapSvg||!mapZoom)return;if(c.regional||!countryLayers.has(c.code)){const p=mapProjection([c.lng,c.lat]);if(!p)return;const [w,h]=mapSize();mapSvg.call(mapZoom.transform,d3.zoomIdentity.translate(w/2,h/2).scale(4).translate(-p[0],-p[1]));return;}const f=countryLayers.get(c.code),b=mapPath.bounds(f),[w,h]=mapSize();const dx=b[1][0]-b[0][0],dy=b[1][1]-b[0][1],x=(b[0][0]+b[1][0])/2,y=(b[0][1]+b[1][1])/2,k=Math.min(6,.72/Math.max(dx/w,dy/h));mapSvg.call(mapZoom.transform,d3.zoomIdentity.translate(w/2,h/2).scale(k).translate(-x,-y));}
function tooltip(c){return `${c.name}${c.caution?'*':''}\n${subjects[state.subject]}: ${format(c[state.subject])}\n${gapText(value(c,state.subject,'gap'))}${c.regional?'\nRegional result':''}`;}
function styleValues(f){const c=countryFor(f),selected=active(c)&&c.code===state.selected.code;return {stroke:selected?'#315ad8':'#ffffff',width:selected?2.8:.8,fill:colour(active(c)?value(c,state.subject,state.mode):null,state.mode)};}
function paintMap(){
 if(!mapRoot)return;
 mapRoot.selectAll('path.country').attr('fill',f=>styleValues(f).fill).attr('stroke',f=>styleValues(f).stroke).attr('stroke-width',f=>styleValues(f).width).each(function(f){const c=countryFor(f);d3.select(this).select('title').text(c?tooltip(c):`${f.properties.name}\nNo result in this snapshot`);});
 const dots=visible().filter(c=>c.regional||!countryLayers.has(c.code)||['SGP','BRN','LUX','QAT','PSE'].includes(c.code));
 const sel=mapRoot.select('g.points').selectAll('circle.map-point').data(dots,d=>d.code).join('circle').attr('class',d=>`map-point${d.code===state.selected.code?' selected':''}`).attr('r',7).attr('cx',d=>mapProjection([d.lng,d.lat])?.[0]??-99).attr('cy',d=>mapProjection([d.lng,d.lat])?.[1]??-99).attr('fill',d=>colour(value(d,state.subject,state.mode),state.mode)).attr('stroke','#fff').attr('stroke-width',2).attr('tabindex',0).attr('role','button').attr('aria-label',d=>tooltip(d).replaceAll('\n',', ')).on('click',(e,d)=>select(d,false)).on('keydown',(e,d)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select(d,false);}});
 sel.selectAll('title').data(d=>[d]).join('title').text(tooltip);
}
function render(){
 const {subject:s,selected:c}=state,list=visible();
 document.querySelectorAll('[data-region]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.region===state.region));
 document.querySelectorAll('[data-subject]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.subject===s));
 $('map-title').textContent=state.region==='sea'?'Southeast Asia':'The international picture';
 $('coverage').textContent=`${list.filter(x=>x[s]!=null).length} of ${list.length} countries and economies with a verified ${subjects[s].toLowerCase()} score`;
 $('legend-title').textContent=state.mode==='gap'?'Point gap compared with Malaysia':`${subjects[s]} · mean score`;
 const bands=state.mode==='gap'?[[-51,'Below −50'],[-1,'−50 to −1'],[0,'Malaysia / equal'],[1,'+1 to +49'],[50,'+50 or more']]:[[399,'Below 400'],[400,'400–449'],[450,'450–499'],[500,'500–549'],[550,'550 or more']];
 $('legend').innerHTML=bands.map(([n,label])=>`<span><i style="background:${colour(n,state.mode)}"></i>${label}</span>`).join('');
 const bars=[{name:c.name,score:c[s],fill:'#4b9fab'},...(c.code==='MYS'?[]:[{name:'Malaysia',score:malaysia[s],fill:'#315ad8'}]),{name:'OECD average',score:oecd[s],fill:'#81939e'}];
 $('detail').innerHTML=`<p class="eyebrow">${c.code==='MYS'?'YOUR COMPARISON ANCHOR':'SELECTED COUNTRY / ECONOMY'}</p><h2>${esc(c.name)}${c.caution?'*':''}</h2><p class="subtitle">${subjects[s]} · PISA 2025${c.regional?' · Regional result':''}</p><div class="score${c[s]==null?' missing':''}">${format(c[s])}</div><p class="gap">${c[s]==null?'No verified value in this snapshot':c.code==='MYS'?`${Math.abs(c[s]-oecd[s])} points ${c[s]>=oecd[s]?'above':'below'} the OECD average`:gapText(value(c,s,'gap'))}</p><div class="bars">${bars.map(b=>`<div class="bar-row"><div class="bar-label"><span>${esc(b.name)}</span><b>${format(b.score)}</b></div><div class="bar-track"><div class="bar-fill" style="width:${b.score==null?0:b.score/650*100}%;background:${b.fill}"></div></div></div>`).join('')}</div><p class="detail-note">2022–2025 change: <strong>${trend(c)}</strong>${c.ns.includes(s)?'<br>† Not statistically significant.':''}</p>${s==='science'&&c.lowScience!=null?`<p class="detail-note">${c.lowScience}% scored below baseline proficiency in science.</p>`:''}${c.note?`<p class="detail-note">${esc(c.note)}</p>`:''}${c.caution?'<p class="detail-note">* OECD sampling caution applies. Read the country notes before interpreting comparisons.</p>':''}<a class="source-link" href="${s==='science'||s==='digital'||c.code==='BSZ'?c.source:c.profile}" target="_blank" rel="noopener">View OECD source ↗</a>${c.code==='MYS'?'':'<button class="home-button" id="back-malaysia">Back to Malaysia ↗</button>'}`;
 $('back-malaysia')?.addEventListener('click',()=>select(malaysia));
 $('table-title').textContent=`${subjects[s]} ${state.region==='sea'?'across Southeast Asia':'around the world'}`;
 const sorted=[...list].sort(state.sort==='name'?(a,b)=>a.name.localeCompare(b.name):(a,b)=>(b[s]??-Infinity)-(a[s]??-Infinity)||a.name.localeCompare(b.name));
 $('rows').innerHTML=sorted.map(x=>`<tr class="${x.code===c.code?'selected':''}"><td><button data-country="${x.code}" aria-label="Compare ${esc(x.name)} with Malaysia">${esc(x.name)}${x.caution?'*':''}</button>${x.regional?'<small>Regional result</small>':x.code==='MYS'?'<small>Comparison anchor</small>':''}</td><td><strong>${format(x[s])}</strong></td><td>${signed(value(x,s,'gap'))}</td><td>${signed(x[s]==null?null:x[s]-oecd[s])}</td><td>${trend(x)}</td></tr>`).join('');paintMap();
}
 $('subjects').innerHTML=Object.entries(subjects).map(([key,label])=>`<button data-subject="${key}" aria-pressed="${key===state.subject}">${label}</button>`).join('');
 $('country-options').innerHTML=[...countries].sort((a,b)=>a.name.localeCompare(b.name)).map(c=>`<option value="${esc(c.name)}"></option>`).join('');
 document.querySelectorAll('[data-region]').forEach(b=>b.addEventListener('click',()=>{state.region=b.dataset.region;if(state.region==='sea'&&state.selected.region!=='sea')state.selected=malaysia;render();fit();}));
 $('subjects').addEventListener('click',e=>{const b=e.target.closest('[data-subject]');if(b){state.subject=b.dataset.subject;render();}});
 $('measure').addEventListener('change',e=>{state.mode=e.target.value;render();});
 $('sort').addEventListener('change',e=>{state.sort=e.target.value;render();});
 $('rows').addEventListener('click',e=>{const b=e.target.closest('[data-country]');if(b){select(countries.find(c=>c.code===b.dataset.country));$('controls').scrollIntoView({block:'start'});}});
 $('reset').addEventListener('click',fit);
 $('search').addEventListener('input',()=>{$('search').setCustomValidity('');});
 $('search-form').addEventListener('submit',e=>{e.preventDefault();const query=$('search').value.trim().toLowerCase();const aliases={vietnam:'VNM',brunei:'BRN','south korea':'KOR',taiwan:'TWN',china:'BSZ','hong kong':'HKG',macao:'MAC',macau:'MAC',uk:'GBR',usa:'USA'};const c=countries.find(x=>x.name.toLowerCase()===query||x.code.toLowerCase()===query||x.code===aliases[query])||(query?countries.find(x=>x.name.toLowerCase().includes(query)):null);if(c){$('search').value=c.name;select(c);$('search').setCustomValidity('');}else{$('search').setCustomValidity('Choose one of the 91 countries and economies in the list.');$('search').reportValidity();}});
render();
async function initialiseMap(){
 if(!window.d3){$('map-status').textContent='The mapping service could not load. Country search and the comparison table remain available.';return;}
 const host=d3.select('#map');host.selectAll('*').remove();
 mapSvg=host.append('svg').attr('class','world-svg').attr('role','img').attr('aria-label','Interactive PISA world map');
 mapRoot=mapSvg.append('g').attr('class','map-root');mapRoot.append('g').attr('class','countries');mapRoot.append('g').attr('class','points');
 mapZoom=d3.zoom().scaleExtent([1,8]).on('zoom',e=>mapRoot.attr('transform',e.transform));mapSvg.call(mapZoom).on('dblclick.zoom',null);
 resetProjection();
 try{
  const response=await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json',{signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error('Map download failed');
  const topology=await response.json();if(!window.topojson)throw Error('Boundary reader unavailable');
  features=topojson.feature(topology,topology.objects.countries).features.filter(f=>f.properties.name!=='Antarctica');
  countryLayers.clear();features.forEach(f=>{const c=countryFor(f);if(c)countryLayers.set(c.code,f);});
  mapRoot.select('g.countries').selectAll('path.country').data(features).join('path').attr('class','country').attr('d',mapPath).attr('vector-effect','non-scaling-stroke').attr('tabindex',f=>countryFor(f)?0:null).attr('role',f=>countryFor(f)?'button':null).on('click',(e,f)=>{const c=countryFor(f);if(c)select(c,false);}).on('keydown',(e,f)=>{const c=countryFor(f);if(c&&(e.key==='Enter'||e.key===' ')){e.preventDefault();select(c,false);}}).each(function(f){d3.select(this).append('title');});
  paintMap();$('map-status').textContent='';fit();
 }catch(error){$('map-status').textContent='Country boundaries could not load. Search and all comparisons still work.';paintMap();}
 let resizeFrame;new ResizeObserver(()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{resetProjection();fit();paintMap();});}).observe($('map'));
}
initialiseMap();
// Optional WebMCP support uses the same visible selection action.
if(document.modelContext?.registerTool){try{Promise.resolve(document.modelContext.registerTool({name:'select_pisa_comparison',description:'Select a country or economy and subject in the PISA comparison map.',inputSchema:{type:'object',properties:{countryCode:{type:'string',enum:countries.map(c=>c.code)},subject:{type:'string',enum:Object.keys(subjects)}},required:['countryCode','subject'],additionalProperties:false},annotations:{readOnlyHint:false},execute:input=>{const c=countries.find(c=>c.code===input?.countryCode);if(!c||!Object.hasOwn(subjects,input?.subject))throw Error('Choose a listed country and subject.');state.subject=input.subject;select(c);return {country:c.name,subject:subjects[state.subject],score:c[state.subject],malaysia:malaysia[state.subject],oecd:oecd[state.subject]};}})).catch(()=>{});}catch{}}
