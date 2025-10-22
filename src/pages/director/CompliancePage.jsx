import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';
import { getComplianceDetails, getOpenViolationsCount } from '../../lib/api/directorComplete';
import {
  PageHeader,
  DataTable,
  StatusBadge,
  LoadingSpinner,
  EmptyState,
  Select,
  StatCard
} from '../../components/director/PremiumComponents';

export default function CompliancePage() {
  const { session } = useAuth();
  const orgId = session?.user?.org_id || '00000000-0000-0000-0000-000000000000';

  const [violations, setViolations] = useState([]);
  const [violationsCount, setViolationsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [violationsData, count] = await Promise.all([
        getComplianceDetails(orgId, statusFilter || undefined),
        getOpenViolationsCount(orgId)
      ]);
      setViolations(violationsData || []);
      setViolationsCount(count);
    } catch (error) {
      console.error('Failed to fetch compliance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'deal_name',
      label: 'Deal',
      render: (row) => (
        <div>
          <p style={{ fontWeight: '600', color: '#111827', margin: 0 }}>
            {row.deal_name}
          </p>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>
            {row.deal_id?.slice(0, 8)}
          </p>
        </div>
      )
    },
    {
      key: 'athlete_name',
      label: 'Athlete',
      render: (row) => row.athlete_name || 'Unknown'
    },
    {
      key: 'brand_name',
      label: 'Brand',
      render: (row) => row.brand_name || '-'
    },
    {
      key: 'compliance_status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.compliance_status} />
    },
    {
      key: 'age_days',
      label: 'Age',
      render: (row) => (
        <span style={{
          fontWeight: '600',
          color: row.age_days > 30 ? '#ef4444' : row.age_days > 14 ? '#f59e0b' : '#6b7280'
        }}>
          {row.age_days || 0} days
        </span>
      )
    },
    {
      key: 'compliance_notes',
      label: 'Notes',
      render: (row) => (
        <div style={{ maxWidth: '300px' }}>
          <p style={{ 
            fontSize: '14px', 
            color: '#374151',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            margin: 0
          }}>
            {row.compliance_notes || '-'}
          </p>
        </div>
      )
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (row) => format(new Date(row.created_at), 'MMM d, yyyy')
    }
  ];

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100%' }}>
      <PageHeader
        title="Compliance Dashboard"
        description="Monitor deal compliance and violations"
      />

      <div style={{ padding: '32px' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '24px',
          marginBottom: '32px'
        }}>
          <StatCard
            label="Open Violations"
            value={violationsCount}
            icon={AlertTriangle}
            loading={loading}
          />
          <StatCard
            label="Total Issues"
            value={violations.length}
            icon={ShieldCheck}
            loading={loading}
          />
          <StatCard
            label="Compliance Rate"
            value={
              violations.length > 0
                ? `${Math.round(
                    ((violations.filter((v) => v.compliance_status === 'pass').length) /
                      violations.length) *
                      100
                  )}%`
                : 'N/A'
            }
            icon={ShieldCheck}
            loading={loading}
          />
        </div>

        <div style={{
          backgroundColor: 'white',
          border: '1px solid #f3f4f6',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{
            padding: '20px 32px',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Select
                placeholder="All statuses"
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: 'fail', label: 'Failed' },
                  { value: 'warning', label: 'Warning' },
                  { value: 'pass', label: 'Passed' },
                  { value: 'pending', label: 'Pending' }
                ]}
              />
              {statusFilter && (
                <button
                  onClick={() => setStatusFilter('')}
                  style={{
                    fontSize: '14px',
                    color: '#059669',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Clear filter
                </button>
              )}
            </div>
          </div>

          <DataTable
            columns={columns}
            data={violations}
            loading={loading}
            emptyState={
              <EmptyState
                icon={ShieldCheck}
                title="No compliance issues"
                description={
                  statusFilter
                    ? 'No issues found with this status'
                    : 'All deals are compliant'
                }
              />
            }
          />
        </div>
      </div>
    </div>
  );
}
