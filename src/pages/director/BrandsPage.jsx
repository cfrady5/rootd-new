import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Building2 } from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';
import { getBrandBreakdown } from '../../lib/api/directorComplete';
import {
  PageHeader,
  LoadingSpinner,
  EmptyState,
  StatusBadge
} from '../../components/director/PremiumComponents';

export default function BrandsPage() {
  const { session } = useAuth();
  const orgId = session?.user?.org_id || '00000000-0000-0000-0000-000000000000';

  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: format(new Date(new Date().getFullYear(), 0, 1), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });

  useEffect(() => {
    fetchBrands();
  }, [dateRange]);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const data = await getBrandBreakdown(
        orgId,
        dateRange.startDate,
        dateRange.endDate
      );
      setBrands(data || []);
    } catch (error) {
      console.error('Failed to fetch brands:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: '#f9fafb', minHeight: '100%' }}>
        <PageHeader title="Brands" />
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100%' }}>
      <PageHeader
        title="Brands"
        description={`${brands.length} total brands`}
      />

      <div style={{
        backgroundColor: '#f9fafb',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 32px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, startDate: e.target.value }))
            }
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#111827',
              backgroundColor: 'white'
            }}
          />
          <span style={{ fontSize: '14px', color: '#6b7280' }}>to</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
            }
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#111827',
              backgroundColor: 'white'
            }}
          />
        </div>
      </div>

      <div style={{ padding: '32px' }}>
        {brands.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No brands found"
            description="No brand data available for this period"
          />
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {brands.map((brand) => (
              <div
                key={brand.brand_id}
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #f3f4f6',
                  borderRadius: '16px',
                  padding: '28px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                }}
              >
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '20px',
                  letterSpacing: '-0.01em'
                }}>
                  {brand.brand_name || 'Unknown Brand'}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>Deals</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#3b82f6' }}>
                      {brand.deal_count}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>Total Spend</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#059669' }}>
                      ${((brand.total_spend_cents || 0) / 100).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>Avg Deal</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#8b5cf6' }}>
                      ${((brand.avg_deal_cents || 0) / 100).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    paddingTop: '12px',
                    borderTop: '1px solid #f3f4f6'
                  }}>
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>Compliance Rate</span>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: brand.compliance_pass_rate >= 0.8 ? '#059669' :
                             brand.compliance_pass_rate >= 0.5 ? '#f59e0b' : '#ef4444'
                    }}>
                      {Math.round(brand.compliance_pass_rate * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
