import React from "react";
export default function MetricCard({icon,label,value}){
  return (
    <div className="card" style={{padding:16}}>
      <div style={{display:"flex",alignItems:"center",gap:10,color:"#6b7280",fontWeight:700}}>
        <span>{icon}</span>{label}
      </div>
      <div style={{marginTop:10,fontSize:22,fontWeight:800}}>{value}</div>
    </div>
  );
}
