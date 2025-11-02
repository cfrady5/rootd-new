import React from 'react';
import RootLayout from '../../app/RootLayout.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import StatCard from '../../components/ui/StatCard.jsx';

export default function DashboardPage(){
  return (
    <RootLayout>
      <PageHeader title="Dashboard" description="Overview of your performance" />
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(220px,1fr))',gap:16}}>
        <StatCard label="Total Matches" value={0} trend="up" change={0} />
        <StatCard label="Saved Deals" value={0} trend="up" change={0} />
        <StatCard label="Unread Messages" value={0} trend="down" change={0} />
      </div>
    </RootLayout>
  );
}