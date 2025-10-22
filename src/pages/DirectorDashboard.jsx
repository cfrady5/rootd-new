// src/pages/DirectorDashboard.jsx
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
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
  Cell,
} from 'recharts';
import { useAuth } from '../auth/AuthProvider';
import { useDirectorDashboard, useDeals } from '../hooks/useDirectorData';
import { exportDealsToCsv } from '../lib/directorApi';
import LoadingScreen from '../components/LoadingScreen';

// Color palette for charts
const CHART_COLORS = {
  active: '#10b981', // green
  pending: '#f59e0b', // amber
  completed: '#3b82f6', // blue
  paused: '#6b7280', // gray
  cancelled: '#ef4444', // red
  committed: '#8b5cf6', // purple
  paid: '#06b6d4', // cyan
};

const STATUS_COLORS = [
  CHART_COLORS.active,
  CHART_COLORS.pending,
  CHART_COLORS.completed,
  CHART_COLORS.paused,
  CHART_COLORS.cancelled,
];

export default function DirectorDashboard() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });
  const [filters, setFilters] = useState({
    status: null,
    week: null,
  });

  // Get user's org_id from profile
  // In a real app, this would come from the profile table
  const orgId = user?.user_metadata?.org_id || null;

  // Fetch all dashboard data
  const {
    statusBreakdown,
    stageAge,
    moneySummary,
    compliance,
    weeklyDeals,
    timeline,
    violationsCount,
    loading,
    error,
  } = useDirectorDashboard(orgId, dateRange);

  // Handle date range changes
  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  // Handle quick date range buttons
  const handleQuickRange = (days) => {
    setDateRange({
      startDate: format(subDays(new Date(), days), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd'),
    });
  };

  // Handle chart clicks for filtering
  const handleStatusClick = (data) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status === data.deal_status ? null : data.deal_status,
    }));
  };

  const handleWeekClick = (data) => {
    setFilters((prev) => ({
      ...prev,
      week: prev.week === data.week_start ? null : data.week_start,
    }));
  };

  // Handle CSV export
  const handleExport = async () => {
    try {
      const result = await exportDealsToCsv(orgId, {
        ...dateRange,
        status: filters.status,
      });
      // Show success toast
      console.log('Exported to:', result.path);
      // Automatically download the file
      window.open(result.url, '_blank');
    } catch (err) {
      console.error('Export failed:', err);
      // Show error toast
      alert('Failed to export CSV: ' + err.message);
    }
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return <LoadingScreen message="Loading dashboard data..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!orgId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            No Organization
          </h2>
          <p className="text-gray-600">
            Your account is not associated with an organization.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Director Dashboard
          </h1>

          {/* Date Range and Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            {/* Quick Range Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => handleQuickRange(7)}
                className="px-3 py-1.5 text-sm font-medium rounded-md bg-white border border-gray-300 hover:bg-gray-50"
                aria-label="Show last 7 days"
              >
                Last 7 days
              </button>
              <button
                onClick={() => handleQuickRange(30)}
                className="px-3 py-1.5 text-sm font-medium rounded-md bg-white border border-gray-300 hover:bg-gray-50"
                aria-label="Show last 30 days"
              >
                Last 30 days
              </button>
              <button
                onClick={() => handleQuickRange(90)}
                className="px-3 py-1.5 text-sm font-medium rounded-md bg-white border border-gray-300 hover:bg-gray-50"
                aria-label="Show last 90 days"
              >
                Last 90 days
              </button>
            </div>

            {/* Custom Date Range */}
            <div className="flex gap-2 items-center">
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  handleDateRangeChange({
                    ...dateRange,
                    startDate: e.target.value,
                  })
                }
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                aria-label="Start date"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  handleDateRangeChange({
                    ...dateRange,
                    endDate: e.target.value,
                  })
                }
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                aria-label="End date"
              />
            </div>

            {/* Export Button */}
            <button
              onClick={handleExport}
              className="ml-auto px-4 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              aria-label="Export data to CSV"
            >
              Export CSV
            </button>
          </div>

          {/* Active Filters */}
          {(filters.status || filters.week) && (
            <div className="mt-4 flex gap-2 items-center">
              <span className="text-sm text-gray-600">Active filters:</span>
              {filters.status && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded-md">
                  Status: {filters.status}
                  <button
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, status: null }))
                    }
                    className="ml-1 hover:text-blue-900"
                    aria-label="Clear status filter"
                  >
                    ✕
                  </button>
                </span>
              )}
              {filters.week && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded-md">
                  Week: {filters.week}
                  <button
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, week: null }))
                    }
                    className="ml-1 hover:text-blue-900"
                    aria-label="Clear week filter"
                  >
                    ✕
                  </button>
                </span>
              )}
              <button
                onClick={() => setFilters({ status: null, week: null })}
                className="text-sm text-blue-600 hover:text-blue-800"
                aria-label="Clear all filters"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            label="Total Committed"
            value={formatCurrency(moneySummary.total_committed || 0)}
            icon="💰"
            color="purple"
          />
          <KPICard
            label="Paid to Date"
            value={formatCurrency(moneySummary.total_paid || 0)}
            icon="✅"
            color="green"
          />
          <KPICard
            label="Open Violations"
            value={violationsCount}
            icon="⚠️"
            color="red"
          />
          <KPICard
            label="Active Deals"
            value={
              statusBreakdown.find((s) => s.deal_status === 'active')
                ?.deal_count || 0
            }
            icon="📊"
            color="blue"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Status Breakdown - Donut Chart */}
          <ChartCard title="Deal Status Breakdown">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusBreakdown}
                  dataKey="deal_count"
                  nameKey="deal_status"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  onClick={handleStatusClick}
                  style={{ cursor: 'pointer' }}
                  aria-label="Deal status breakdown chart"
                >
                  {statusBreakdown.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                      opacity={
                        filters.status && filters.status !== entry.deal_status
                          ? 0.3
                          : 1
                      }
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [value, name]}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-500 text-center mt-2">
              Click a segment to filter
            </p>
          </ChartCard>

          {/* Deals Per Week - Bar Chart */}
          <ChartCard title="Deals Created Per Week">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={weeklyDeals}
                onClick={(data) => data?.activePayload?.[0] && handleWeekClick(data.activePayload[0].payload)}
                style={{ cursor: 'pointer' }}
              >
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
                    borderRadius: '0.375rem',
                  }}
                />
                <Bar
                  dataKey="deal_count"
                  fill={CHART_COLORS.active}
                  radius={[4, 4, 0, 0]}
                  aria-label="Deals created per week"
                />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-500 text-center mt-2">
              Click a bar to filter
            </p>
          </ChartCard>
        </div>

        {/* Timeline Chart - Full Width */}
        <ChartCard title="Committed vs Paid Timeline" className="mb-8">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="month"
                tickFormatter={(value) => format(new Date(value), 'MMM yyyy')}
                stroke="#6b7280"
              />
              <YAxis
                tickFormatter={(value) => formatCurrency(value)}
                stroke="#6b7280"
              />
              <Tooltip
                labelFormatter={(value) =>
                  format(new Date(value), 'MMMM yyyy')
                }
                formatter={(value) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="total_committed"
                stroke={CHART_COLORS.committed}
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Committed"
                aria-label="Total committed timeline"
              />
              <Line
                type="monotone"
                dataKey="total_paid"
                stroke={CHART_COLORS.paid}
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Paid"
                aria-label="Total paid timeline"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* TODO: Add DataTable component here */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Deal Details
          </h2>
          <p className="text-gray-600">
            Table view coming soon with pagination, sorting, and filtering.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// KPI Card Component
function KPICard({ label, value, icon, color }) {
  const colorClasses = {
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    blue: 'bg-blue-50 text-blue-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${colorClasses[color]}`}
          aria-hidden="true"
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

// Chart Card Component
function ChartCard({ title, children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-lg shadow p-6 ${className}`}
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
      {children}
    </motion.div>
  );
}
