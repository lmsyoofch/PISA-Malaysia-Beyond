import {countries} from './data.js';
export const regions={sea:'Southeast Asia',east:'East Asia',west:'West & Central Asia',europe:'Europe',americas:'The Americas',africa:'Africa',oceania:'Oceania'};
const groups={sea:'MYS SGP VNM BRN THA IDN PHL KHM',east:'BSZ MAC TWN JPN KOR HKG MNG',west:'TUR ARE UZB QAT ISR GEO KAZ SAU AZE JOR LBN ARM KGZ PSE KIR DTJ',americas:'CAN USA URY CHL CRI COL MEX BRA PER ECU ARG SLV DOM PRY GTM',africa:'MUS MAR ZMB KEN RWA',oceania:'AUS NZL'};
export const regionOf=c=>Object.entries(groups).find(([,codes])=>codes.split(' ').includes(c.code))?.[0]||'europe';
export const members=region=>countries.filter(c=>regionOf(c)===region).sort((a,b)=>a.code==='MYS'?-1:b.code==='MYS'?1:a.name.localeCompare(b.name));
export const pageOf=c=>Math.floor(members(regionOf(c)).findIndex(x=>x.code===c.code)/8);
export const subjectColours={science:0x5aa687,math:0xd5a65c,reading:0x8e8fc2,digital:0x55a8be};
export const quests=[
 {title:'Meet your neighbours',text:'Visit Malaysia and two other Southeast Asian pavilions.',test:visits=>visits.has('MYS')&&countries.filter(c=>regionOf(c)==='sea'&&c.code!=='MYS'&&visits.has(c.code)).length>=2,hint:'Start with Malaysia, Singapore and Thailand.',region:'sea'},
 {title:'Find a meaningful science improvement',text:'In Science, visit a country whose 2022–2025 increase was statistically significant.',test:(visits,scienceVisits)=>countries.some(c=>scienceVisits.has(c.code)&&c.changes.science>0&&!c.ns.includes('science')),hint:'The Philippines is one place to investigate. Read the change and its significance note.',region:'sea'},
 {title:'Look beyond Southeast Asia',text:'Explore pavilions in three different regional campuses.',test:visits=>new Set(countries.filter(c=>visits.has(c.code)).map(regionOf)).size>=3,hint:'Use the region portals or the selector to visit two more campuses.',region:'europe'}
];
// Bounded grid routing keeps walking paths out of pavilions and the tree pond.
export function walkRoute(start,end,blocked){
 const valid=(x,z)=>Math.abs(x)<=22&&Math.abs(z)<=22&&!blocked(x,z);
 function nearest(p){const x=Math.round(p.x),z=Math.round(p.z);if(valid(x,z))return [x,z];for(let r=1;r<=3;r++)for(let a=-r;a<=r;a++)for(let b=-r;b<=r;b++)if(valid(x+a,z+b))return [x+a,z+b];return null;}
 const a=nearest(start),b=nearest(end);if(!a||!b)return [];
 const key=(x,z)=>x+','+z,goal=key(...b),queue=[a],previous=new Map([[key(...a),null]]);let head=0;
 while(head<queue.length){const [x,z]=queue[head++],k=key(x,z);if(k===goal){const route=[];let p=k;while(p){route.push(p.split(',').map(Number));p=previous.get(p);}route.reverse();return route.filter((p,i)=>i===0||i===route.length-1||p[0]-route[i-1][0]!==route[i+1][0]-p[0]||p[1]-route[i-1][1]!==route[i+1][1]-p[1]);}
 for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,nz=z+dz,nk=key(nx,nz);if(valid(nx,nz)&&!previous.has(nk)){previous.set(nk,k);queue.push([nx,nz]);}}
 }
 return [];
}
