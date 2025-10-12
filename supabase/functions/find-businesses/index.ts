// supabase/functions/find-businesses/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const CORS={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"POST,OPTIONS","Access-Control-Allow-Headers":"authorization,apikey,content-type"};
type Body={lat?:number;lng?:number;radiusMiles?:number;topics?:string[]};
const r=(b:unknown,s=200)=>new Response(JSON.stringify(b),{status:s,headers:{"content-type":"application/json",...CORS}});
Deno.serve(async req=>{
  if(req.method==="OPTIONS") return new Response(null,{status:204,headers:CORS});
  if(req.method!=="POST") return r({ok:false,error:"method_not_allowed"},405);
  let body:Body={}; try{body=await req.json()}catch{}
  const {lat,lng}=body; const radius=Math.round(((body.radiusMiles??5)*1609.34)||1600);
  const topics=(Array.isArray(body.topics)&&body.topics.length?body.topics:["coffee"]);
  if(typeof lat!=="number"||typeof lng!=="number") return r({ok:false,error:"location_required",detail:{lat,lng}},400);
  const KEY=Deno.env.get("GOOGLE_MAPS_API_KEY"); if(!KEY) return r({ok:false,error:"missing_google_key"},500);
  const keyword=encodeURIComponent(topics[0]);
  const url=`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&keyword=${keyword}&key=${KEY}`;
  try{
    const resp=await fetch(url); const json=await resp.json();
    if(!resp.ok) return r({ok:false,error:"google_error",status:resp.status,json},502);
    if(json.status!=="OK" && json.status!=="ZERO_RESULTS") return r({ok:false,error:"places_status",status:json.status,message:json.error_message??null},502);
    const results=(json.results||[]).slice(0,20).map((p:any)=>({
      source:"google_places",is_verified:true,business_place_id:p.place_id,place_id:p.place_id,
      name:p.name,category:Array.isArray(p.types)?p.types[0]??null:null,address:p.vicinity??p.formatted_address??null,
      city:null,website:null,rating:typeof p.rating==="number"?p.rating:null,types:Array.isArray(p.types)?p.types:null,
      distance_meters:null,photo_url:null,
    }));
    return r({ok:true,results,meta:{topicUsed:topics[0],count:results.length}});
  }catch(e){ return r({ok:false,error:"fetch_failed",message:(e as Error).message},500); }
});
