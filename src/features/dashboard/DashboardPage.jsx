import React from 'react';
import RootLayout from '../../app/RootLayout.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';

export default function DashboardPage(){
  return (
    <RootLayout>
      <PageHeader title="Dashboard" description="Overview of your performance" />
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(220px,1fr))',gap:16}}>
        <div style={{background:'#fff',border:'1px solid var(--color-border)',padding:16,borderRadius:12}}>Total Matches: 0</div>
        <div style={{background:'#fff',border:'1px solid var(--color-border)',padding:16,borderRadius:12}}>Saved Deals: 0</div>
        <div style={{background:'#fff',border:'1px solid var(--color-border)',padding:16,borderRadius:12}}>Unread Messages: 0</div>
      </div>
    </RootLayout>
  );
}