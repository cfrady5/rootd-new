// src/pages/DemoPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import FooterCTA from "../components/FooterCTA.jsx";

/* Google Maps API key */
const GOOGLE_MAPS_KEY = "AIzaSyA-eOIl5NRe7Jju6uiGo1FvJpAWsNE_ZKY";

/* Demo data */
const BASE_ATHLETES = [
  { 
    name: "Sarah Johnson", 
    email: "sarah.j@stanford.edu", 
    sport: "Basketball", 
    classYear: "Junior",
    followers: 15400,
    engagement: 8.4,
    avatar: "🏀"
  },
  { 
    name: "Marcus Chen", 
    email: "m.chen@stanford.edu", 
    sport: "Swimming", 
    classYear: "Senior",
    followers: 8200,
    engagement: 12.1,
    avatar: "🏊"
  },
  { 
    name: "Emma Rodriguez", 
    email: "emma.r@stanford.edu", 
    sport: "Soccer", 
    classYear: "Sophomore",
    followers: 22100,
    engagement: 6.8,
    avatar: "⚽"
  },
  { 
    name: "Jake Williams", 
    email: "jake.w@stanford.edu", 
    sport: "Football", 
    classYear: "Senior",
    followers: 31500,
    engagement: 5.2,
    avatar: "🏈"
  },
  { 
    name: "Aisha Patel", 
    email: "a.patel@stanford.edu", 
    sport: "Track & Field", 
    classYear: "Freshman",
    followers: 5800,
    engagement: 15.3,
    avatar: "🏃"
  },
  { 
    name: "Tyler Brooks", 
    email: "t.brooks@stanford.edu", 
    sport: "Baseball", 
    classYear: "Junior",
    followers: 12600,
    engagement: 7.9,
    avatar: "⚾"
  },
];

const PARTNER_BUSINESSES = [
  { name: "Blue Bottle Coffee", lat: 37.444635, lng: -122.161847, category: "☕ Coffee Shop", dealValue: "$500-800/mo" },
  { name: "Shake Shack Palo Alto", lat: 37.444947, lng: -122.163861, category: "🍔 Restaurant", dealValue: "$1,200-2,000/mo" },
  { name: "Lululemon Palo Alto", lat: 37.443719, lng: -122.161056, category: "👕 Apparel", dealValue: "$800-1,500/mo" },
  { name: "SoulCycle Palo Alto", lat: 37.443478, lng: -122.160259, category: "💪 Fitness", dealValue: "$600-1,000/mo" },
  { name: "Peet's Coffee", lat: 37.445123, lng: -122.162847, category: "☕ Coffee Shop", dealValue: "$400-700/mo" },
];

/* Helpers */
function ri(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function seedAthletes() {
  return BASE_ATHLETES.map(a => ({ 
    ...a, 
    profilePct: ri(85, 100), 
    activeDeals: ri(1, 5),
    pendingDeals: ri(0, 3),
    totalValue: ri(2000, 8000)
  }));
}

/* Main Component */
export default function DemoPage() {
  const [tab, setTab] = useState("Athlete");
  const [showBanner, setShowBanner] = useState(true);

  return (
    <div className="page-container" style={{ 
      background: 'var(--bg-primary)',
      minHeight: '100vh',
      paddingTop: '80px'
    }}>
      <div className="page-content" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 80px' }}>
        {showBanner && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 16px',
            background: 'linear-gradient(135deg, rgba(44, 95, 52, 0.1) 0%, rgba(44, 95, 52, 0.05) 100%)',
            border: '1px solid rgba(44, 95, 52, 0.2)',
            borderRadius: '12px',
            marginBottom: '20px',
            backdropFilter: 'blur(10px)'
          }}>
            <div>
              <div style={{ 
                fontWeight: '700', 
                fontSize: '16px',
                color: 'var(--ink)',
                marginBottom: '2px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '20px' }}>🎬</span>
                Interactive Platform Demo
              </div>
              <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
                Explore how athletes and directors use Rootd to discover and manage NIL partnerships
              </div>
            </div>
            <button 
              style={{
                background: 'var(--green)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => e.target.style.opacity = '0.9'}
              onMouseLeave={e => e.target.style.opacity = '1'}
              onClick={() => setShowBanner(false)}
            >
              Got it
            </button>
          </div>
        )}

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '20px',
          background: 'white',
          padding: '4px',
          borderRadius: '10px',
          border: '1px solid var(--hair)',
          width: 'fit-content',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <button 
            onClick={() => setTab("Athlete")} 
            style={{
              padding: '8px 24px',
              borderRadius: '8px',
              border: 'none',
              background: tab === "Athlete" ? 'var(--green)' : 'transparent',
              color: tab === "Athlete" ? 'white' : 'var(--muted)',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🏃</span> Athlete View
          </button>
          <button 
            onClick={() => setTab("Director")} 
            style={{
              padding: '8px 24px',
              borderRadius: '8px',
              border: 'none',
              background: tab === "Director" ? 'var(--green)' : 'transparent',
              color: tab === "Director" ? 'white' : 'var(--muted)',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>📊</span> Director View
          </button>
        </div>

        {tab === "Athlete" ? <AthleteView /> : <DirectorView />}
      </div>

      {/* Footer CTA */}
      <FooterCTA />
    </div>
  );
}

/* Director Portal */
function DirectorView() {
  const [athletes] = useState(seedAthletes);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(
    () => athletes.filter(a => {
      const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) || 
                           a.sport.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === "all" || a.sport === filter;
      return matchesSearch && matchesFilter;
    }),
    [athletes, search, filter]
  );

  const totalValue = athletes.reduce((sum, a) => sum + a.totalValue, 0);
  const totalDeals = athletes.reduce((sum, a) => sum + a.activeDeals, 0);
  const sports = [...new Set(athletes.map(a => a.sport))];

  return (
    <div>
      {/* Header */}
            {/* Director Portal Header */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid var(--hair)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h2 style={{ 
              margin: '0 0 4px', 
              fontSize: '28px', 
              fontWeight: '700',
              color: 'var(--ink)'
            }}>
              Director Portal
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '14px', margin: 0 }}>
              Manage your athletes, monitor compliance, and track partnership performance
            </p>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, var(--green) 0%, var(--green-light) 100%)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 8px rgba(44, 95, 52, 0.2)',
            whiteSpace: 'nowrap'
          }}>
            <span>✓</span> All Compliant
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px'
        }}>
          <div style={{
            padding: '16px',
            background: 'rgba(44, 95, 52, 0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(44, 95, 52, 0.1)'
          }}>
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px', fontWeight: '500' }}>
              Total Athletes
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--green)' }}>
              {athletes.length}
            </div>
          </div>
          <div style={{
            padding: '16px',
            background: 'rgba(59, 130, 246, 0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(59, 130, 246, 0.1)'
          }}>
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px', fontWeight: '500' }}>
              Active Deals
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#3B82F6' }}>
              {totalDeals}
            </div>
          </div>
          <div style={{
            padding: '16px',
            background: 'rgba(139, 92, 246, 0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(139, 92, 246, 0.1)'
          }}>
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px', fontWeight: '500' }}>
              Monthly Value
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#8B5CF6' }}>
              ${(totalValue).toLocaleString()}
            </div>
          </div>
          <div style={{
            padding: '16px',
            background: 'rgba(236, 72, 153, 0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(236, 72, 153, 0.1)'
          }}>
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px', fontWeight: '500' }}>
              Avg per Athlete
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#EC4899' }}>
              ${Math.round(totalValue / athletes.length).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Athletes Table */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        border: '1px solid var(--hair)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
        marginBottom: '16px'
      }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--hair)' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '17px', fontWeight: '700', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            🏃 Athlete Roster
          </h3>
          
          {/* Search and Filter */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              style={{
                flex: '1',
                minWidth: '220px',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--hair)',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              placeholder="🔍 Search athletes by name or sport..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={e => e.target.style.borderColor = 'var(--green)'}
              onBlur={e => e.target.style.borderColor = 'var(--hair)'}
            />
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--hair)',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                outline: 'none',
                background: 'white'
              }}
            >
              <option value="all">All Sports</option>
              {sports.map(sport => (
                <option key={sport} value={sport}>{sport}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--hair)' }}>
                <th style={tableHeader}>Athlete</th>
                <th style={tableHeader}>Sport</th>
                <th style={tableHeader}>Class</th>
                <th style={tableHeader}>Followers</th>
                <th style={tableHeader}>Engagement</th>
                <th style={tableHeader}>Active Deals</th>
                <th style={tableHeader}>Monthly Value</th>
                <th style={tableHeader}>Profile</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => (
                <tr key={i} style={{
                  borderBottom: '1px solid var(--hair)',
                  transition: 'background 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-primary)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={tableCell}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'var(--green)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        flexShrink: 0
                      }}>
                        {a.avatar}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: 'var(--ink)', fontSize: '14px' }}>{a.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{a.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={tableCell}>{a.sport}</td>
                  <td style={tableCell}>{a.classYear}</td>
                  <td style={tableCell}>
                    <strong>{(a.followers / 1000).toFixed(1)}K</strong>
                  </td>
                  <td style={tableCell}>
                    <span style={{
                      padding: '4px 10px',
                      background: a.engagement > 10 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                      color: a.engagement > 10 ? '#16A34A' : '#CA8A04',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '13px',
                      fontWeight: '600'
                    }}>
                      {a.engagement}%
                    </span>
                  </td>
                  <td style={tableCell}>
                    <div style={{ fontWeight: '600', color: 'var(--green)' }}>{a.activeDeals} active</div>
                    {a.pendingDeals > 0 && (
                      <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{a.pendingDeals} pending</div>
                    )}
                  </td>
                  <td style={tableCell}>
                    <strong style={{ color: 'var(--ink)' }}>${a.totalValue.toLocaleString()}</strong>
                  </td>
                  <td style={tableCell}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        flex: 1,
                        height: '6px',
                        background: 'var(--hair)',
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${a.profilePct}%`,
                          height: '100%',
                          background: 'var(--green)',
                          transition: 'width 0.3s ease'
                        }}/>
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--muted)', minWidth: '35px' }}>
                        {a.profilePct}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Map Section */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '20px',
        border: '1px solid var(--hair)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <h3 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: '700', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          📍 Partner Businesses Near Campus
        </h3>
        <p style={{ color: 'var(--muted)', fontSize: '13px', margin: '0 0 14px' }}>
          Local businesses actively seeking athlete partnerships
        </p>
        <Map markers={PARTNER_BUSINESSES} />
        
        {/* Business List */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '10px',
          marginTop: '14px'
        }}>
          {PARTNER_BUSINESSES.map((b, i) => (
            <div key={i} style={{
              padding: '12px',
              background: 'var(--bg-primary)',
              borderRadius: '10px',
              border: '1px solid var(--hair)',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            >
              <div style={{ fontWeight: '600', marginBottom: '2px', color: 'var(--ink)', fontSize: '14px' }}>{b.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '6px' }}>{b.category}</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--green)' }}>{b.dealValue}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const tableHeader = {
  padding: '12px 14px',
  textAlign: 'left',
  fontSize: '11px',
  fontWeight: '700',
  color: 'var(--muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const tableCell = {
  padding: '12px 14px',
  fontSize: '13px',
  color: 'var(--ink)'
};

/* Athlete Portal */
function AthleteView() {
  const athlete = {
    name: "Sarah Johnson",
    sport: "Basketball",
    classYear: "Junior",
    email: "sarah.j@stanford.edu",
    avatar: "🏀",
    followers: 15400,
    engagement: 8.4,
    socials: { 
      instagram: "@sarahj_hoops", 
      twitter: "@SJohnson23", 
      tiktok: "@sarahbasketball",
      youtube: "@SarahJHoops"
    },
  };

  const matches = [
    { 
      brand: "Blue Bottle Coffee", 
      status: "Suggested", 
      estValue: 600,
      category: "☕ Coffee Shop",
      matchScore: 92,
      reason: "Strong local presence, aligns with morning routine content"
    },
    { 
      brand: "Lululemon Palo Alto", 
      status: "Negotiating", 
      estValue: 1200,
      category: "👕 Apparel",
      matchScore: 95,
      reason: "Perfect fit for athletic lifestyle content"
    },
    { 
      brand: "SoulCycle Palo Alto", 
      status: "Active", 
      estValue: 800,
      category: "💪 Fitness",
      matchScore: 88,
      reason: "Cross-training content opportunity"
    },
  ];

  const totalMonthly = matches.reduce((sum, m) => sum + m.estValue, 0);

  return (
    <div>
      {/* Profile Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--green) 0%, var(--green-light) 100%)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(44, 95, 52, 0.2)',
        boxShadow: '0 8px 24px rgba(44, 95, 52, 0.15)',
        marginBottom: '16px',
        color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '36px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            flexShrink: 0
          }}>
            {athlete.avatar}
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h2 style={{ margin: '0 0 4px', fontSize: '28px', fontWeight: '700', lineHeight: '1.2' }}>
              {athlete.name}
            </h2>
            <div style={{ fontSize: '15px', opacity: 0.9, marginBottom: '4px' }}>
              {athlete.sport} • {athlete.classYear} • Stanford University
            </div>
            <div style={{ fontSize: '13px', opacity: 0.8 }}>{athlete.email}</div>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            padding: '16px 20px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.3)',
            textAlign: 'center',
            minWidth: '140px'
          }}>
            <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '2px' }}>Est. Monthly Value</div>
            <div style={{ fontSize: '28px', fontWeight: '700' }}>${totalMonthly.toLocaleString()}</div>
          </div>
        </div>

        {/* Social Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '12px',
          marginTop: '20px',
          padding: '16px',
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <div>
            <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '2px' }}>Total Followers</div>
            <div style={{ fontSize: '20px', fontWeight: '700' }}>{(athlete.followers / 1000).toFixed(1)}K</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '2px' }}>Engagement Rate</div>
            <div style={{ fontSize: '20px', fontWeight: '700' }}>{athlete.engagement}%</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '2px' }}>Active Deals</div>
            <div style={{ fontSize: '20px', fontWeight: '700' }}>{matches.filter(m => m.status === 'Active').length}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '2px' }}>Profile Score</div>
            <div style={{ fontSize: '20px', fontWeight: '700' }}>95%</div>
          </div>
        </div>
      </div>

      {/* Social Accounts */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '20px',
        border: '1px solid var(--hair)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '16px'
      }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '17px', fontWeight: '700', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          📱 Connected Social Accounts
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '10px'
        }}>
          {Object.entries(athlete.socials).map(([platform, handle]) => (
            <div key={platform} style={{
              padding: '12px',
              background: 'var(--bg-primary)',
              borderRadius: '10px',
              border: '1px solid var(--hair)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: platform === 'instagram' ? '#E1306C' : 
                           platform === 'twitter' ? '#1DA1F2' :
                           platform === 'tiktok' ? '#000000' : '#FF0000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '700',
                fontSize: '16px',
                flexShrink: 0
              }}>
                {platform === 'instagram' ? '📷' : 
                 platform === 'twitter' ? '🐦' :
                 platform === 'tiktok' ? '🎵' : '📺'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: '600' }}>
                  {platform}
                </div>
                <div style={{ fontWeight: '600', color: 'var(--ink)', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{handle}</div>
              </div>
              <span style={{ color: 'var(--green)', fontSize: '16px' }}>✓</span>
            </div>
          ))}
        </div>
      </div>

      {/* Partnership Matches */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '20px',
        border: '1px solid var(--hair)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '16px'
      }}>
        <h3 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: '700', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          🤝 Partnership Opportunities
        </h3>
        <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '16px', margin: '0 0 16px' }}>
          AI-matched businesses looking for athletes like you
        </p>

        <div style={{ display: 'grid', gap: '12px' }}>
          {matches.map((m, i) => (
            <div key={i} style={{
              padding: '16px',
              background: 'var(--bg-primary)',
              borderRadius: '12px',
              border: '1px solid var(--hair)',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--green)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--hair)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <h4 style={{ margin: '0 0 2px', fontSize: '16px', fontWeight: '700', color: 'var(--ink)' }}>
                    {m.brand}
                  </h4>
                  <div style={{ color: 'var(--muted)', fontSize: '13px' }}>{m.category}</div>
                </div>
                <div style={{
                  padding: '4px 12px',
                  background: m.status === 'Active' ? 'rgba(34, 197, 94, 0.1)' :
                             m.status === 'Negotiating' ? 'rgba(234, 179, 8, 0.1)' :
                             'rgba(59, 130, 246, 0.1)',
                  color: m.status === 'Active' ? '#16A34A' :
                        m.status === 'Negotiating' ? '#CA8A04' :
                        '#3B82F6',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  whiteSpace: 'nowrap'
                }}>
                  {m.status}
                </div>
              </div>

              <div style={{ 
                padding: '10px 12px',
                background: 'white',
                borderRadius: '8px',
                marginBottom: '12px'
              }}>
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '2px', fontWeight: '500' }}>
                  Why this match?
                </div>
                <div style={{ fontSize: '13px', color: 'var(--ink)', lineHeight: '1.4' }}>{m.reason}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '2px' }}>Match Score</div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--green)' }}>
                      {m.matchScore}%
                    </div>
                  </div>
                  <div style={{ width: '1px', height: '24px', background: 'var(--hair)' }}></div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '2px' }}>Est. Monthly Value</div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--ink)' }}>
                      ${m.estValue}
                    </div>
                  </div>
                </div>
                <button style={{
                  padding: '8px 16px',
                  background: m.status === 'Active' ? 'var(--muted)' : 'var(--green)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: m.status === 'Active' ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: '13px',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={e => {
                  if (m.status !== 'Active') e.target.style.opacity = '0.9';
                }}
                onMouseLeave={e => e.target.style.opacity = '1'}
                >
                  {m.status === 'Active' ? '✓ Active Deal' : 
                   m.status === 'Negotiating' ? 'Continue Chat' : 
                   'Start Conversation'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Map Section */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '20px',
        border: '1px solid var(--hair)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <h3 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: '700', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          📍 Nearby Partner Businesses
        </h3>
        <p style={{ color: 'var(--muted)', fontSize: '13px', margin: '0 0 14px' }}>
          Explore local businesses near your campus
        </p>
        <Map markers={PARTNER_BUSINESSES} />
      </div>
    </div>
  );
}

/* Google Map Component */
function Map({ markers }) {
  const ref = useRef(null);
  useEffect(() => {
    const id = "gmaps-sdk";
    if (!document.getElementById(id)) {
      const s = document.createElement("script");
      s.id = id;
      s.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}`;
      s.async = true;
      document.body.appendChild(s);
      s.onload = init;
    } else init();

    function init() {
      if (!window.google || !ref.current) return;
      const map = new window.google.maps.Map(ref.current, {
        center: { lat: 37.4275, lng: -122.1697 },
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
      });
      const bounds = new window.google.maps.LatLngBounds();
      markers.forEach(m => {
        const marker = new window.google.maps.Marker({ map, position: { lat: m.lat, lng: m.lng }, title: m.name });
        const info = new window.google.maps.InfoWindow({
          content: `<div style="font-weight:600">${m.name}</div><div style="font-size:12px;color:#6B7280">${m.category}</div>`,
        });
        marker.addListener("click", () => info.open(map, marker));
        bounds.extend(marker.getPosition());
      });
      map.fitBounds(bounds);
    }
  }, [markers]);

  return <div ref={ref} style={{ width: "100%", height: 280, border: "1px solid #E5E7EB", borderRadius: 10 }} />;
}


