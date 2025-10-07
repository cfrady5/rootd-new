import React from "react";

export default function Sidebar({ active="overview"}){
  return (
    <aside className="sidebar">
      <div className={`side-item ${active==='overview'?'active':''}`}>🧑‍💼 Overview</div>
      <div className={`side-item ${active==='matches'?'active':''}`}>🏆 My Matches</div>
      <div className={`side-item ${active==='edit'?'active':''}`}>⚙️ Edit Profile</div>
    </aside>
  );
}
