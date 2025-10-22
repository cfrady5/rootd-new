import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { DollarSign } from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';
import {
  getMoneySummary,
  getCommittedVsPaidTimeline,
  getBrandBreakdown
} from '../../lib/api/directorComplete';
import {
  PageHeader,
  LoadingSpinner,
  StatCard
} from '../../components/director/PremiumComponents';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function FinancePage() {
  const { session } = useAuth();
  const orgId = session?.user?.org_id || '00000000-0000-0000-0000-000000000000';

  const [moneySummary, setMoneySummary] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [topBrands, setTopBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: format(new Date(new Date().getFullYear(), 0, 1), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });

  useEffect(() => {
    fetchFinancialData();
  }, [dateRange]);

  const fetchFinancialData = async () => {
    setLoading(true);
    try {
      const [money, timelineData, brands] = await Promise.all([
        getMoneySummary(orgId, dateRange.startDate, dateRange.endDate),
        getCommittedVsPaidTimeline(orgId, dateRange.startDate, dateRange.endDate),
        getBrandBreakdown(orgId, dateRange.startDate, dateRange.endDate)
      ]);

      setMoneySummary(money);
      setTimeline(timelineData || []);
      setTopBrands((brands || []).sort((a, b) => b.total_spend_cents - a.total_spend_cents).slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (cents) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(cents / 100);
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: '#f9fafb', minHeight: '100%' }}>
        <PageHeader title="Finance" />
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100%' }}>
      <PageHeader
        title="Financial Summary"
        description="Track committed funds, payments, and brand spending"
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
        {/* Summary Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
          gap: '24px',
          marginBottom: '32px'
        }}>
          <StatCard
            label="Total Committed"
            value={formatCurrency(moneySummary?.total_payout_committed || 0)}
            icon={DollarSign}
          />
          <StatCard
            label="Paid to Date"
            value={formatCurrency(moneySummary?.total_paid_to_date || 0)}
            icon={DollarSign}
          />
          <StatCard
            label="Remaining"
            value={formatCurrency(moneySummary?.total_remaining || 0)}
            icon={DollarSign}
          />
          <StatCard
            label="Avg Deal Size"
            value={formatCurrency(moneySummary?.avg_deal_size || 0)}
            icon={DollarSign}
          />
        </div>

        {/* Timeline Chart */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #f3f4f6',
          borderRadius: '16px',
          padding: '28px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          marginBottom: '32px'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#111827',
            margin: '0 0 20px 0',
            letterSpacing: '-0.01em'
          }}>
            Committed vs Paid Timeline
          </h2>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="period"
                tickFormatter={(value) => format(new Date(value), 'MMM yyyy')}
                stroke="#6b7280"
              />
              <YAxis
                tickFormatter={(value) => formatCurrency(value)}
                stroke="#6b7280"
              />
              <Tooltip
                labelFormatter={(value) => format(new Date(value), 'MMMM yyyy')}
                formatter={(value) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="cumulative_committed"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Committed"
              />
              <Line
                type="monotone"
                dataKey="cumulative_paid"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Paid"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Brands */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #f3f4f6',
          borderRadius: '16px',
          padding: '28px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#111827',
            margin: '0 0 20px 0',
            letterSpacing: '-0.01em'
          }}>
            Top 5 Brands by Spend
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topBrands.map((brand, idx) => (
              <div
                key={brand.brand_id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#059669'
                  }}>
                    {idx + 1}
                  </div>
                  <div>
                    <p style={{ fontWeight: '600', color: '#111827', margin: 0 }}>
                      {brand.brand_name || 'Unknown'}
                    </p>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>
                      {brand.deal_count} deals
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '20px', fontWeight: '700', color: '#059669', margin: 0 }}>
                    {formatCurrency(brand.total_spend_cents)}
                  </p>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>
                    {formatCurrency(brand.avg_deal_cents)} avg
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
