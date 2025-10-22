import { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import { TrendingUp, DollarSign, AlertTriangle, Handshake, Lightbulb } from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';
import {
  getStatusBreakdown,
  getMoneySummary,
  getDealsPerWeek,
  getCommittedVsPaidTimeline,
  getOpenViolationsCount,
  getDealInsights
} from '../../lib/api/directorComplete';
import {
  PageHeader,
  LoadingSpinner,
  StatCard,
  Button
} from '../../components/director/PremiumComponents';
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

const CHART_COLORS = {
  active: '#10b981',
  negotiation: '#f59e0b',
  approved: '#8b5cf6',
  executed: '#3b82f6',
  pending_payment: '#f97316',
  completed: '#6b7280',
  cancelled: '#ef4444',
  committed: '#8b5cf6',
  paid: '#06b6d4'
};

const STATUS_COLORS = [
  CHART_COLORS.active,
  CHART_COLORS.negotiation,
  CHART_COLORS.approved,
  CHART_COLORS.executed,
  CHART_COLORS.pending_payment,
  CHART_COLORS.completed,
  CHART_COLORS.cancelled
];

export default function DirectorOverviewPage() {
  const { session } = useAuth();
  const orgId = session?.user?.org_id || '00000000-0000-0000-0000-000000000000';

  const [dateRange, setDateRange] = useState({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });

  const [statusBreakdown, setStatusBreakdown] = useState([]);
  const [moneySummary, setMoneySummary] = useState(null);
  const [weeklyDeals, setWeeklyDeals] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [violationsCount, setViolationsCount] = useState(0);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [status, money, weekly, timelineData, violations, insightsData] =
        await Promise.all([
          getStatusBreakdown(orgId, dateRange.startDate, dateRange.endDate),
          getMoneySummary(orgId, dateRange.startDate, dateRange.endDate),
          getDealsPerWeek(orgId, dateRange.startDate, dateRange.endDate),
          getCommittedVsPaidTimeline(orgId, dateRange.startDate, dateRange.endDate),
          getOpenViolationsCount(orgId),
          getDealInsights(orgId)
        ]);

      setStatusBreakdown(status || []);
      setMoneySummary(money);
      setWeeklyDeals(weekly || []);
      setTimeline(timelineData || []);
      setViolationsCount(violations);
      setInsights(insightsData || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
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

  const handleQuickRange = (days) => {
    setDateRange({
      startDate: format(subDays(new Date(), days), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd')
    });
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: '#f9fafb', minHeight: '100%' }}>
        <PageHeader title="Overview" />
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100%' }}>
      <PageHeader
        title="Overview"
        description={`Dashboard for ${format(new Date(dateRange.startDate), 'MMM d')} - ${format(new Date(dateRange.endDate), 'MMM d, yyyy')}`}
      />

      <div style={{
        backgroundColor: '#f9fafb',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 32px'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
          <Button onClick={() => handleQuickRange(7)} variant="secondary" size="sm">
            Last 7 days
          </Button>
          <Button onClick={() => handleQuickRange(30)} variant="secondary" size="sm">
            Last 30 days
          </Button>
          <Button onClick={() => handleQuickRange(90)} variant="secondary" size="sm">
            Last 90 days
          </Button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '16px' }}>
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
      </div>

      <div style={{ padding: '32px' }}>
        {/* KPI Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
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
            label="Open Violations"
            value={violationsCount}
            icon={AlertTriangle}
          />
          <StatCard
            label="Active Deals"
            value={
              statusBreakdown.find((s) => s.status === 'active')?.deal_count || 0
            }
            icon={Handshake}
          />
        </div>

        {/* Insights */}
        {insights.length > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
            border: '1px solid #a7f3d0',
            borderRadius: '16px',
            padding: '28px',
            marginBottom: '32px',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Lightbulb style={{ width: '24px', height: '24px', color: 'white' }} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  color: '#065f46', 
                  margin: '0 0 16px 0',
                  letterSpacing: '-0.01em'
                }}>
                  Actionable Insights
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {insights.slice(0, 3).map((insight) => (
                    <div
                      key={insight.insight_key}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        backgroundColor: 'white',
                        padding: '16px',
                        borderRadius: '12px',
                        border: '1px solid #a7f3d0'
                      }}
                    >
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          marginTop: '6px',
                          flexShrink: 0,
                          backgroundColor: 
                            insight.severity === 'critical' ? '#ef4444' :
                            insight.severity === 'warning' ? '#f59e0b' :
                            '#3b82f6'
                        }}
                      />
                      <div>
                        <p style={{ 
                          fontWeight: '600', 
                          color: '#111827',
                          margin: '0 0 4px 0',
                          fontSize: '14px'
                        }}>
                          {insight.title}
                        </p>
                        <p style={{ 
                          color: '#065f46',
                          margin: 0,
                          fontSize: '14px',
                          lineHeight: '1.5'
                        }}>
                          {insight.description}
                        </p>
                        {insight.metric_value && (
                          <p style={{ 
                            fontSize: '12px', 
                            color: '#059669',
                            margin: '4px 0 0 0',
                            fontWeight: '500'
                          }}>
                            Value: {insight.metric_value}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', 
          gap: '24px',
          marginBottom: '24px'
        }}>
          {/* Status Breakdown */}
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
              Deal Status Breakdown
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusBreakdown}
                  dataKey="deal_count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                >
                  {statusBreakdown.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [value, name]}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Deals Per Week */}
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
              Deals Created Per Week
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyDeals}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="week_start"
                  tickFormatter={(value) => format(new Date(value), 'MM/dd')}
                  stroke="#6b7280"
                />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  labelFormatter={(value) =>
                    `Week of ${format(new Date(value), 'MMM dd, yyyy')}`
                  }
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem'
                  }}
                />
                <Bar
                  dataKey="deal_count"
                  fill={CHART_COLORS.active}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Timeline Chart - Full Width */}
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
            Committed vs Paid Timeline
          </h2>
          <ResponsiveContainer width="100%" height={300}>
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
                stroke={CHART_COLORS.committed}
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Committed"
              />
              <Line
                type="monotone"
                dataKey="cumulative_paid"
                stroke={CHART_COLORS.paid}
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Paid"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
