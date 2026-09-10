import {countries,subjects,malaysia,oecd,value,format,signed,colour} from './data.js';
const $=id=>document.getElementById(id);
const state={subject:'science',mode:'score',region:'sea',selected:malaysia,sort:'score'};
let map,land,points;
let overview=true;
const countryLayers=new Map();
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const visible=()=>countries.filter(c=>state.region==='global'||c.region==='sea');
const countryFor=f=>countries.find(c=>!c.regional&&(c.mapName===f.properties.name||(c.code==='MKD'&&f.properties.name==='Macedonia')||(c.code==='CZE'&&f.properties.name==='Czech Republic')));
const active=c=>c&&(state.region==='global'||c.region==='sea');
const gapText=n=>n===null?'No verified score for this subject':n===0?'Same mean score as Malaysia':`${Math.abs(n)} points ${n>0?'above':'below'} Malaysia`;
const trend=c=>c.changes[state.subject]==null?'Not available':`${signed(c.changes[state.subject])}${c.ns.includes(state.subject)?'†':''}`;
function select(c,fly=true){state.selected=c;if(c.region!=='sea'&&state.region==='sea')state.region='global';render();if(map&&fly){map.invalidateSize({pan:false});const layer=countryLayers.get(c.code);if(layer&&!c.regional&&c.code!=='FRA')map.fitBounds(layer.getBounds(),{padding:[45,45],maxZoom:5,animate:false});else map.setView([c.lat,c.lng],c.regional?4:5,{animate:false});overview=false;}}
function fit(){if(map){map.invalidateSize({pan:false});map.fitBounds(state.region==='sea'?[[-13,91],[26,142]]:[[-56,-180],[84,180]],{padding:[8,8],animate:false});overview=true;}}
function tooltip(c){return `<strong>${esc(c.name)}${c.caution?'*':''}</strong><br>${esc(subjects[state.subject])}: ${format(c[state.subject])}<br>${gapText(value(c,state.subject,'gap'))}${c.regional?'<br>Regional result':''}`;}
function style(f){const c=countryFor(f),selected=active(c)&&c.code===state.selected.code;return {color:selected?'#315ad8':'#ffffff',weight:selected?2.8:.8,fillColor:colour(active(c)?value(c,state.subject,state.mode):null,state.mode),fillOpacity:1};}
function paintMap(){
 if(!map)return;
 if(land){land.setStyle(style);land.eachLayer(layer=>{const c=countryFor(layer.feature);layer.setTooltipContent(c?tooltip(c):`<strong>${esc(layer.feature.properties.name)}</strong><br>No result in this snapshot`);if(c?.code===state.selected.code)layer.bringToFront();});}
 points.clearLayers();
 for(const c of visible()){
  if(land&&countryLayers.has(c.code)&&!c.regional&&!['SGP','BRN','LUX','QAT','PSE'].includes(c.code))continue;
  // CircleMarker radii are screen pixels, never metres or zoom-scaled HTML.
  const selected=c.code===state.selected.code;
  const marker=L.circleMarker([c.lat,c.lng],{radius:window.matchMedia('(max-width:700px)').matches?4:5,weight:selected?2:1,color:selected?'#315ad8':'#ffffff',fillColor:colour(value(c,state.subject,state.mode),state.mode),fillOpacity:1}).addTo(points).bindTooltip(tooltip(c),{direction:'top'}).on('click',()=>select(c,false));
  const element=marker.getElement();
  if(element){element.setAttribute('tabindex','0');element.setAttribute('role','button');element.setAttribute('aria-label',`${c.name}: ${format(c[state.subject])}. Select to compare.`);element.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();select(c,false);}});}
 }
}
function render(){
 $('map').dataset.region=state.region;
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
 if(!window.L){$('map-status').textContent='The mapping service could not load. Country search and the comparison table remain available.';return;}
 map=L.map('map',{scrollWheelZoom:false,minZoom:0,maxZoom:8,zoomSnap:0,zoomDelta:.5,zoomAnimation:false,markerZoomAnimation:false,worldCopyJump:false,maxBounds:[[-85,-190],[85,190]],maxBoundsViscosity:.8});
 map.attributionControl.addAttribution('Geography: <a href="https://www.naturalearthdata.com/">Natural Earth</a>');
 points=L.layerGroup().addTo(map);fit();paintMap();
 map.on('dragstart zoomstart',()=>{overview=false;});
 new ResizeObserver(()=>{const shouldFit=overview;map.invalidateSize({pan:false});if(shouldFit)fit();paintMap();}).observe($('map'));
 try{
  const response=await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json',{signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw Error('Map download failed');
  const topology=await response.json();if(!window.topojson)throw Error('Boundary reader unavailable');
  const features=topojson.feature(topology,topology.objects.countries).features.filter(f=>f.properties.name!=='Antarctica');
  land=L.geoJSON(features,{style,onEachFeature:(f,layer)=>{const c=countryFor(f);if(c)countryLayers.set(c.code,layer);layer.bindTooltip(c?tooltip(c):`<strong>${esc(f.properties.name)}</strong><br>No result in this snapshot`);layer.on({click:()=>{if(c)select(c,false);else layer.openTooltip();},mouseover:()=>layer.setStyle({weight:2,color:'#688d9e'}),mouseout:()=>layer.setStyle(style(f))});}}).addTo(map);
  paintMap();$('map-status').textContent='';
 }catch(error){$('map-status').textContent='Country boundaries could not load. Showing country dots instead; search and all comparisons still work.';}
}
initialiseMap();
// Optional WebMCP support uses the same visible selection action.
if(document.modelContext?.registerTool){try{Promise.resolve(document.modelContext.registerTool({name:'select_pisa_comparison',description:'Select a country or economy and subject in the PISA comparison map.',inputSchema:{type:'object',properties:{countryCode:{type:'string',enum:countries.map(c=>c.code)},subject:{type:'string',enum:Object.keys(subjects)}},required:['countryCode','subject'],additionalProperties:false},annotations:{readOnlyHint:false},execute:input=>{const c=countries.find(c=>c.code===input?.countryCode);if(!c||!Object.hasOwn(subjects,input?.subject))throw Error('Choose a listed country and subject.');state.subject=input.subject;select(c);return {country:c.name,subject:subjects[state.subject],score:c[state.subject],malaysia:malaysia[state.subject],oecd:oecd[state.subject]};}})).catch(()=>{});}catch{}}
