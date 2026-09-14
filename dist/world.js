import {countries,subjects,malaysia,oecd,signed,format} from './data.js';
import {regions,regionOf,members,pageOf,subjectColours,quests,walkRoute} from './world-model.js';
const $=id=>document.getElementById(id),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const state={region:'sea',page:0,subject:'science',selected:'MYS'};
const visits=new Set(),scienceVisits=new Set();
let world=null;
function open(id){$(id).showModal();}
for(const dialog of document.querySelectorAll('dialog')){dialog.querySelector('.close').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});}
function changeSubject(s){state.subject=s;document.querySelectorAll('[data-subject]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.subject===s));world?.highlight();$('status').textContent=`${subjects[s]} gateway opened. Visit a country pavilion to explore its results.`;if($('country-dialog').open)showCountry(countries.find(c=>c.code===state.selected),false);}
function changeRegion(region,page=0){state.region=region;state.page=page;$('region').value=region;$('place').textContent=region==='sea'?'Malaysia plaza':regions[region]+' garden';const count=Math.ceil(members(region).length/8);$('page').textContent=`${page+1} / ${count}`;$('previous').disabled=page===0;$('next').disabled=page===count-1;world?.build();$('status').textContent=`Welcome to ${regions[region]}. Tap a pavilion to explore.`;}
function travel(c){for(const d of document.querySelectorAll('dialog[open]'))d.close();state.selected=c.code;if(state.region!==regionOf(c)||state.page!==pageOf(c))changeRegion(regionOf(c),pageOf(c));if(world){world.visit(c);$('status').textContent=`Walking to ${c.name}…`;}else showCountry(c);}
function updateQuests(){const completed=quests.filter(q=>q.test(visits,scienceVisits)).length;$('quest-count').textContent=`${completed} / 3`;$('visited').textContent=`${visits.size} of 91 pavilions explored`;$('quests').innerHTML=quests.map((q,i)=>{const done=q.test(visits,scienceVisits);return `<section class="quest ${done?'complete':''}"><h3>${done?'✓':'◇'} ${q.title}</h3><p>${q.text}</p><details><summary>Hint</summary><p>${q.hint}</p></details><button data-quest="${i}">${done?'Explore again':'Take me there'} ↗</button></section>`;}).join('');}
function showCountry(c,mark=true){
 state.selected=c.code;if(mark){visits.add(c.code);if(state.subject==='science')scienceVisits.add(c.code);updateQuests();}const s=state.subject,n=c[s],gap=n==null?null:n-malaysia[s];
 const bars=[{name:c.name,n},...(c.code==='MYS'?[]:[{name:'Malaysia',n:malaysia[s],colour:'#bd924c'}]),{name:'OECD average',n:oecd[s],colour:'#708b94'}];
 $('country-content').innerHTML=`<p class="eyebrow">${c.code==='MYS'?'YOUR COMPARISON ANCHOR':esc(regions[regionOf(c)])}</p><h2>${esc(c.name)}${c.caution?'*':''}</h2><span class="chip">${subjects[s]} · PISA 2025</span><div class="score ${n==null?'missing':''}">${format(n)}${n==null?'':'<small>score points</small>'}</div><p>${n==null?'No verified score for this subject in the current snapshot.':c.code==='MYS'?`${Math.abs(n-oecd[s])} points ${n>=oecd[s]?'above':'below'} the OECD average.`:gap===0?'The same rounded mean score as Malaysia.':`${Math.abs(gap)} points ${gap>0?'above':'below'} Malaysia.`}</p>${bars.map(b=>`<div class="bar"><div><span>${esc(b.name)}</span><b>${format(b.n)}</b></div>${b.n==null?'':`<progress style="--bar:${b.colour||'#418b80'}" max="650" value="${b.n}" aria-label="${esc(b.name)}: ${b.n} score points"></progress>`}</div>`).join('')}<p>2022–2025 change: <b>${c.changes[s]==null?'Not available':signed(c.changes[s])}</b>${c.ns.includes(s)?'<br><span class="muted">This change was not statistically significant.</span>':''}</p>${c.note?`<p class="muted">${esc(c.note)}</p>`:''}${c.caution?'<p class="muted">* OECD sampling caution applies. Consult the original country notes.</p>':''}<p class="muted">Scores are not percentages. Small gaps are not necessarily statistically meaningful. Pavilions have equal size and do not represent rankings.</p><div class="actions"><a href="${s==='science'||s==='digital'||c.code==='BSZ'?c.source:c.profile}" target="_blank" rel="noopener">OECD source ↗</a><a href="compare.html?country=${c.code}&subject=${s}">Full comparison ↗</a></div>`;
 if(!$('country-dialog').open)open('country-dialog');$('status').textContent=`You reached ${c.name}. Explore the results or close the panel to continue.`;world?.highlight();
}
$('subjects').innerHTML=Object.entries(subjects).map(([s,label])=>`<button data-subject="${s}" aria-pressed="${s===state.subject}"><i style="--subject:#${subjectColours[s].toString(16)}"></i>${label}</button>`).join('');
$('subjects').onclick=e=>{const b=e.target.closest('[data-subject]');if(b)changeSubject(b.dataset.subject);};
$('region').innerHTML=Object.entries(regions).map(([k,n])=>`<option value="${k}">${n}</option>`).join('');$('region').onchange=e=>changeRegion(e.target.value);
$('countries').innerHTML=countries.map(c=>`<option value="${esc(c.name)}"></option>`).join('');
$('search-form').onsubmit=e=>{e.preventDefault();const q=$('search').value.trim().toLowerCase();const aliases={vietnam:'VNM',brunei:'BRN',taiwan:'TWN','south korea':'KOR',china:'BSZ',uk:'GBR',usa:'USA'};const c=countries.find(c=>c.name.toLowerCase()===q||c.code.toLowerCase()===q||c.code===aliases[q])||(q?countries.find(c=>c.name.toLowerCase().includes(q)):null);if(c){$('search').setCustomValidity('');travel(c);}else{$('search').setCustomValidity('Choose a country or economy from the list.');$('search').reportValidity();}};$('search').oninput=()=> $('search').setCustomValidity('');
function directory(){const q=$('filter').value.toLowerCase();$('directory-list').innerHTML=[...countries].sort((a,b)=>a.name.localeCompare(b.name)).filter(c=>(c.name+' '+c.code).toLowerCase().includes(q)).map(c=>`<button data-country="${c.code}"><span>${visits.has(c.code)?'✓ ':''}${esc(c.name)}</span><small>${esc(regions[regionOf(c)])}</small></button>`).join('')||'<p>No matching countries.</p>';}
$('directory-open').onclick=()=>{directory();open('directory-dialog');};$('filter').oninput=directory;$('directory-list').onclick=e=>{const b=e.target.closest('[data-country]');if(b)travel(countries.find(c=>c.code===b.dataset.country));};
$('quest-open').onclick=()=>{updateQuests();open('quest-dialog');};$('quests').onclick=e=>{const b=e.target.closest('[data-quest]');if(b){$('quest-dialog').close();const i=+b.dataset.quest;if(i===1)changeSubject('science');changeRegion(quests[i].region);}};
$('help-open').onclick=()=>open('help-dialog');$('previous').onclick=()=>changeRegion(state.region,state.page-1);$('next').onclick=()=>changeRegion(state.region,state.page+1);$('home').onclick=()=>{changeRegion('sea');world?.reset();};$('reset').onclick=()=>world?.reset();$('zoom-in').onclick=()=>world?.zoom(.85);$('zoom-out').onclick=()=>world?.zoom(1.18);
changeRegion('sea');updateQuests();
async function start(){
 const T=await import('./vendor/three.module.js');
 const scene=new T.Scene();scene.background=new T.Color('#a9cac7');scene.fog=new T.Fog('#a9cac7',65,130);
 const renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.outputColorSpace=T.SRGBColorSpace;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;$('scene').appendChild(renderer.domElement);renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('aria-label','Learning garden. Arrow keys or WASD to walk. Drag to rotate. Use country directory for accessible navigation.');
 const camera=new T.PerspectiveCamera(42,1,.1,180);let theta=.15,distance=52,tilt=.83;
 scene.add(new T.HemisphereLight(0xe4ffef,0x3c585b,2.4));const sun=new T.DirectionalLight(0xffe5b4,3);sun.position.set(-20,35,15);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-30,right:30,top:30,bottom:-30});sun.shadow.normalBias=.06;scene.add(sun);
 const campus=new T.Group();scene.add(campus);let labels=[],targets=[],pavilions=[],gates=[],destination=[],arrival=null;const ray=new T.Raycaster(),pointer=new T.Vector2(),plane=new T.Plane(new T.Vector3(0,1,0),0),hit=new T.Vector3();
 const material=(colour,extra={})=>new T.MeshStandardMaterial({color:colour,roughness:.8,...extra});
 function mesh(geometry,mat,x,y,z,parent=campus){const m=new T.Mesh(geometry,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 function box(w,h,d,mat,x,y,z,parent){return mesh(new T.BoxGeometry(w,h,d),mat,x,y,z,parent);}
 function cylinder(top,bottom,h,mat,x,y,z,parent,segments=12){return mesh(new T.CylinderGeometry(top,bottom,h,segments),mat,x,y,z,parent);}
 function label(text,position,action,kind=''){const b=document.createElement('button');b.className='world-label '+kind;b.textContent=text;b.onclick=action;$('labels').appendChild(b);labels.push({b,position:new T.Vector3(...position)});return b;}
 function clickable(group,action){group.traverse(o=>{if(o.isMesh){o.userData.action=action;targets.push(o);}});}
 const avatar=new T.Group();scene.add(avatar);const coat=material(0xeacb8f),dark=material(0x21414b),skin=material(0xb78562);cylinder(.34,.43,.9,coat,0,1,0,avatar);mesh(new T.SphereGeometry(.28,12,8),skin,0,1.73,0,avatar);cylinder(.35,.4,.12,dark,0,1.95,0,avatar);const legs=[box(.2,.6,.22,dark,-.18,.33,0,avatar),box(.2,.6,.22,dark,.18,.33,0,avatar)];const arms=[box(.16,.7,.18,coat,-.47,1.1,0,avatar),box(.16,.7,.18,coat,.47,1.1,0,avatar)];box(.48,.6,.22,dark,0,1.05,-.35,avatar);const halo=mesh(new T.RingGeometry(.55,.64,32),new T.MeshBasicMaterial({color:0xffe6a0,side:T.DoubleSide}),0,.03,0,avatar);halo.rotation.x=-Math.PI/2;
 function path(x,z){const len=Math.hypot(x,z);const strip=box(1.6,.045,len,material(0xc5ccad),x/2,.028,z/2);strip.rotation.y=Math.atan2(x,z);}
 function tree(x,z,size=1){const wood=material(0x52675a);cylinder(.18*size,.28*size,2.6*size,wood,x,1.3*size,z);for(let i=0;i<3;i++)mesh(new T.IcosahedronGeometry((1.5-i*.22)*size,0),material([0x3a7d65,0x55977b,0x70a287][i]),x+(i-1)*.4*size,(2.8+i*.75)*size,z);}
 function build(){
  destination=[];arrival=null;labels.forEach(l=>l.b.remove());labels=[];targets=[];pavilions=[];gates=[];const mats=new Set(),geometries=new Set();campus.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)mats.add(o.material);});campus.clear();geometries.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());
  cylinder(29,25,2.8,material(0x698b80),0,-1.5,0,undefined,64);cylinder(29,29,.15,material(0x8eaf8e),0,-.05,0,undefined,64);
  cylinder(6,6,.08,material(0xc6ccaf),0,.02,0,undefined,48);cylinder(4.5,4.5,.09,material(0xa6bba0),0,.04,0,undefined,48);
  // Shared knowledge tree, outside the central walking line.
  cylinder(2.2,2.5,.5,material(0xc6d3b5),0,.25,-5);cylinder(1.8,1.8,.1,material(0x4e9998,{metalness:.15}),0,.55,-5);tree(0,-5,1.8);
  for(let i=0;i<23;i++){const angle=i/23*Math.PI*2;tree(Math.cos(angle)*25,Math.sin(angle)*25,.7+(i%3)*.18);}
  const list=members(state.region).slice(state.page*8,state.page*8+8);
  list.forEach((c,i)=>{
   const x=i%2===0?-11:11,z=-14+Math.floor(i/2)*9;path(x*.77,z);
   const group=new T.Group();campus.add(group);group.position.set(x,0,z);const stone=material(0xe0dfc1),trim=material(0x406c64),roof=material(0x31585c),glass=material(0x7fb6af,{metalness:.3,roughness:.3});
   box(5.4,.35,4.4,stone,0,.18,0,group);box(2,.18,1,stone,0,.08,2.6,group);
   for(const a of [-2,2])for(const b of [-1.5,1.5])box(.28,2.7,.28,stone,a,1.7,b,group);
   box(4.7,2.3,.16,glass,0,1.65,-1.5,group);box(4.8,.25,3.7,trim,0,3,0,group);const cap=cylinder(3.4,3.4,.25,roof,0,3.3,0,group,4);cap.rotation.y=Math.PI/4;
   cylinder(.6,.7,.85,trim,0,.8,0,group);mesh(new T.OctahedronGeometry(.5),material(subjectColours[state.subject],{emissive:subjectColours[state.subject],emissiveIntensity:.25}),0,1.7,0,group);
   const ring=mesh(new T.RingGeometry(2.6,2.72,40),new T.MeshBasicMaterial({color:0xffd17c,side:T.DoubleSide}),0,.39,0,group);ring.rotation.x=-Math.PI/2;
   const b=label(c.name,[x,4.1,z],()=>travel(c));pavilions.push({c,ring,b,x,z});clickable(group,()=>travel(c));
  });
  // Four accessible subject gateways form a garden at the front.
  Object.entries(subjects).forEach(([s,name],i)=>{const x=-9+i*6,z=21;const group=new T.Group();group.position.set(x,0,z);campus.add(group);const mat=material(subjectColours[s],{emissive:subjectColours[s],emissiveIntensity:.15});box(.35,2.8,.5,mat,-1,1.4,0,group);box(.35,2.8,.5,mat,1,1.4,0,group);box(2.4,.4,.5,mat,0,2.8,0,group);const disk=cylinder(1.5,1.5,.08,mat,0,.08,0,group);gates.push({s,disk});clickable(group,()=>changeSubject(s));label(s==='digital'?'Computing':name,[x,3.5,z],()=>changeSubject(s),'subject');});
  const regionKeys=Object.keys(regions),current=regionKeys.indexOf(state.region);
  [-1,1].forEach((direction,i)=>{const key=regionKeys[(current+direction+regionKeys.length)%regionKeys.length],x=i===0?-20:20,z=-20;const g=new T.Group();g.position.set(x,0,z);campus.add(g);const mat=material(0x5e8aab,{emissive:0x38648e,emissiveIntensity:.5});box(.45,4,.8,mat,-1.2,2,0,g);box(.45,4,.8,mat,1.2,2,0,g);box(2.8,.45,.8,mat,0,4,0,g);clickable(g,()=>changeRegion(key));label(regions[key]+' ↗',[x,4.8,z],()=>changeRegion(key),'portal');});
  avatar.position.set(0,0,5);highlight();
 }
 function highlight(){pavilions.forEach(p=>{p.ring.visible=p.c.code===state.selected;p.b.classList.toggle('selected',p.c.code===state.selected);});gates.forEach(g=>g.disk.scale.setScalar(g.s===state.subject?1.18:1));}
 function visit(c){const p=pavilions.find(p=>p.c.code===c.code);if(!p)return;destination=walkRoute(avatar.position,{x:p.x,z:p.z+3},blocked).map(([x,z])=>new T.Vector3(x,0,z));arrival=()=>showCountry(c);highlight();}
 function reset(){theta=.15;distance=innerWidth<650?64:52;tilt=.83;}
 function zoom(f){distance=T.MathUtils.clamp(distance*f,22,85);}
 world={build,visit,highlight,reset,zoom};build();reset();
 function size(){const r=$('scene').getBoundingClientRect();renderer.setSize(r.width,r.height);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();}new ResizeObserver(size).observe($('scene'));size();
 const pointers=new Map();let down=null,moved=false,pinch=0;
 renderer.domElement.addEventListener('pointerdown',e=>{renderer.domElement.focus({preventScroll:true});renderer.domElement.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===1){down={x:e.clientX,y:e.clientY};moved=false;}else{moved=true;const p=[...pointers.values()];pinch=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);}});
 renderer.domElement.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;const old=pointers.get(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2){const p=[...pointers.values()],d=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);if(d>0&&pinch>0)zoom(pinch/d);pinch=d;}else if(down){if(Math.hypot(e.clientX-down.x,e.clientY-down.y)>6)moved=true;if(moved)theta-=(e.clientX-old.x)*.008;}});
 renderer.domElement.addEventListener('pointerup',e=>{pointers.delete(e.pointerId);if(!moved&&down){const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);const found=ray.intersectObjects(targets,false)[0];if(found)found.object.userData.action();else if(ray.ray.intersectPlane(plane,hit)&&Math.hypot(hit.x,hit.z)<22){destination=walkRoute(avatar.position,hit,blocked).map(([x,z])=>new T.Vector3(x,0,z));arrival=null;}}if(!pointers.size)down=null;});renderer.domElement.addEventListener('pointercancel',e=>{pointers.delete(e.pointerId);down=null;});renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();zoom(Math.exp(e.deltaY*.001));},{passive:false});
 const keys=new Set();renderer.domElement.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d'].includes(e.key)){e.preventDefault();keys.add(e.key);destination=[];arrival=null;}});window.addEventListener('keyup',e=>keys.delete(e.key));renderer.domElement.addEventListener('blur',()=>keys.clear());
 function blocked(x,z){return Math.hypot(x,z)>23||Math.hypot(x,z+5)<2.5||pavilions.some(p=>Math.abs(x-p.x)<2.8&&Math.abs(z-p.z)<2.3);}
 let last=performance.now(),phase=0;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 function frame(now){requestAnimationFrame(frame);if(now-last<1000/30)return;const dt=Math.min((now-last)/1000,.05);last=now;if(document.hidden)return;let walking=false;
 if(!document.querySelector('dialog[open]')){
  const mx=(keys.has('d')||keys.has('ArrowRight')?1:0)-(keys.has('a')||keys.has('ArrowLeft')?1:0),mz=(keys.has('s')||keys.has('ArrowDown')?1:0)-(keys.has('w')||keys.has('ArrowUp')?1:0);
  if(mx||mz){const dx=(mx*Math.cos(theta)+mz*Math.sin(theta))*dt*6,dz=(-mx*Math.sin(theta)+mz*Math.cos(theta))*dt*6;if(!blocked(avatar.position.x+dx,avatar.position.z+dz)){avatar.position.x+=dx;avatar.position.z+=dz;avatar.rotation.y=Math.atan2(dx,dz);walking=true;}}
  else if(destination.length){const target=destination[0],delta=target.clone().sub(avatar.position);delta.y=0;if(delta.length()<.2){destination.shift();if(!destination.length&&arrival){const fn=arrival;arrival=null;fn();}}else{delta.normalize().multiplyScalar(Math.min(dt*10,target.distanceTo(avatar.position)));const x=avatar.position.x+delta.x,z=avatar.position.z+delta.z;if(blocked(x,z)){// Detour around the central knowledge tree or a pavilion.
   destination=walkRoute(avatar.position,target,blocked).map(([x,z])=>new T.Vector3(x,0,z));
  }else{avatar.position.x=x;avatar.position.z=z;avatar.rotation.y=Math.atan2(delta.x,delta.z);walking=true;}}}
 }
 phase+=dt*12;legs.forEach((leg,i)=>leg.rotation.x=walking&&!reduced?Math.sin(phase+i*Math.PI)*.55:0);arms.forEach((arm,i)=>arm.rotation.x=walking&&!reduced?Math.sin(phase+i*Math.PI+Math.PI)*.4:0);
 camera.position.set(Math.sin(theta)*Math.cos(tilt)*distance,Math.sin(tilt)*distance,Math.cos(theta)*Math.cos(tilt)*distance);camera.lookAt(0,0,0);camera.updateMatrixWorld();
 const w=renderer.domElement.clientWidth,h=renderer.domElement.clientHeight;for(const l of labels){const p=l.position.clone().project(camera);l.b.style.left=`${(p.x+1)/2*w}px`;l.b.style.top=`${(1-p.y)/2*h}px`;l.b.hidden=p.z>1||p.x<-.98||p.x>.98||p.y<-.9||p.y>.8;}
 renderer.render(scene,camera);
 }
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();$('loading').hidden=false;$('loading').innerHTML='<strong>The 3D view paused.</strong><p>Reload to restore it or use Countries and Compare data.</p>';});
 $('loading').hidden=true;requestAnimationFrame(frame);
}
start().catch(error=>{$('loading').innerHTML='<strong>The 3D view could not open.</strong><p>Use Countries to explore every result or open Compare data. The 3D view needs WebGL and an internet connection.</p>';$('status').textContent='Country directory, subjects and comparisons are ready.';console.warn('3D view unavailable',error);});
