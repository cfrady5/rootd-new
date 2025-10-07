import React from "react";

export default function SegmentedTabs({ value, onChange, options }){
  return (
    <div className="pill" role="tablist" aria-label="Mode" style={{gap:6,padding:6}}>
      {options.map(opt=>{
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            onClick={()=>onChange(opt.value)}
            className="pill"
            style={{
              background: active ? "#fff" : "transparent",
              boxShadow: active ? "0 1px 2px rgba(0,0,0,.05)" : "none",
              borderColor: active ? "var(--border)" : "transparent",
              padding:"8px 14px"
            }}
          >
            {opt.icon && <span aria-hidden style={{marginRight:6}}>{opt.icon}</span>}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
