import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/rootd-logo.png';

export default function RootLayout({ sidebar, children }){
  return (
    <div className="page-container">
      <header className="site-header" style={{background:'#fff',borderBottom:'1px solid rgba(15,23,42,0.08)'}}>
        <div className="inner">
          <Link to="/" aria-label="Rootd home" style={{display:'inline-flex',alignItems:'center',textDecoration:'none'}}>
            <img src={logo} alt="Rootd" className="brand-mark" style={{height:56, width:'auto', display:'block'}} />
          </Link>
          <nav style={{display:'flex',gap:'12px'}}>
            <Link to="/demo">Demo</Link>
            <Link to="/pricing">Pricing</Link>
            <Link to="/about">About</Link>
            <Link to="/dashboard">Dashboard</Link>
          </nav>
        </div>
      </header>

      <div className="page-content" role="main">
        {sidebar ? (
          <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:'24px'}}>
            <aside aria-label="Sidebar navigation">{sidebar}</aside>
            <div>{children}</div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}