// Split polygons at the date line before Leaflet projects their straight edges.
// Keep each ring on a continuous longitude branch, then clip to world strips.
function unwrap(ring){
 const result=[];
 for(const point of ring){
  let x=point[0];
  if(result.length){const previous=result[result.length-1][0];while(x-previous>180)x-=360;while(x-previous< -180)x+=360;}
  result.push([x,point[1]]);
 }
 return result;
}
function clip(ring,boundary,keepGreater){
 if(!ring.length)return [];
 const input=ring.slice(0,-1),out=[];
 const inside=p=>keepGreater?p[0]>=boundary:p[0]<=boundary;
 for(let i=0;i<input.length;i++){
  const a=input[(i+input.length-1)%input.length],b=input[i];
  const aInside=inside(a),bInside=inside(b);
  if(aInside!==bInside){const t=(boundary-a[0])/(b[0]-a[0]);out.push([boundary,a[1]+t*(b[1]-a[1])]);}
  if(bInside)out.push([...b]);
 }
 if(out.length<3)return [];
 out.push([...out[0]]);
 return out;
}
function area(ring){let sum=0;for(let i=1;i<ring.length;i++)sum+=ring[i-1][0]*ring[i][1]-ring[i][0]*ring[i-1][1];return Math.abs(sum/2);}
function splitPolygon(polygon){
 const outer=unwrap(polygon[0]);
 const centre=outer.reduce((s,p)=>s+p[0],0)/outer.length;
 const rings=[outer,...polygon.slice(1).map(ring=>{const r=unwrap(ring);const mid=r.reduce((s,p)=>s+p[0],0)/r.length;const shift=360*Math.round((centre-mid)/360);return r.map(([x,y])=>[x+shift,y]);})];
 const xs=outer.map(p=>p[0]);
 const first=Math.floor((Math.min(...xs)+180)/360),last=Math.floor((Math.max(...xs)+180)/360);
 const pieces=[];
 for(let world=first;world<=last;world++){
  const clipped=rings.map(r=>clip(clip(r,-180+world*360,true),180+world*360,false));
  if(!clipped[0].length||area(clipped[0])<1e-10)continue;
  pieces.push(clipped.filter(r=>r.length&&area(r)>=1e-10).map(r=>r.map(([x,y])=>[Math.max(-180,Math.min(180,x-world*360)),y])));
 }
 return pieces;
}
export function splitDateLine(feature){
 const geometry=feature.geometry;
 if(!geometry||!['Polygon','MultiPolygon'].includes(geometry.type))return feature;
 const polygons=geometry.type==='Polygon'?[geometry.coordinates]:geometry.coordinates;
 return {...feature,geometry:{type:'MultiPolygon',coordinates:polygons.flatMap(splitPolygon)}};
}
