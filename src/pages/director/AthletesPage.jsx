import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Users, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';
import {
  getAthleteRollup,
  getComplianceDetails,
  updateAthleteCompliance
} from '../../lib/api/directorComplete';
import {
  PageHeader,
  DataTable,
  StatusBadge,
  LoadingSpinner,
  EmptyState,
  DrawerContainer,
  Button,
  Select
} from '../../components/director/PremiumComponents';

export default function AthletesPage() {
  const { session } = useAuth();
  const orgId = session?.user?.org_id || '00000000-0000-0000-0000-000000000000';

  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: format(new Date(new Date().getFullYear(), 0, 1), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    fetchAthletes();
  }, [dateRange]);

  const fetchAthletes = async () => {
    setLoading(true);
    try {
      const data = await getAthleteRollup(
        orgId,
        dateRange.startDate,
        dateRange.endDate
      );
      setAthletes(data || []);
    } catch (error) {
      console.error('Failed to fetch athletes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (athlete) => {
    setSelectedAthlete(athlete);
    setDrawerOpen(true);
  };

  const columns = [
    {
      key: 'athlete_name',
      label: 'Athlete',
      render: (row) => (
        <div>
          <p style={{ fontWeight: '600', color: '#111827', margin: 0 }}>
            {row.athlete_name || 'Unknown'}
          </p>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>
            {row.athlete_id.slice(0, 8)}
          </p>
        </div>
      )
    },
    {
      key: 'active_deals',
      label: 'Active Deals',
      render: (row) => (
        <span style={{ fontSize: '14px', fontWeight: '600', color: '#3b82f6' }}>
          {row.active_deals || 0}
        </span>
      )
    },
    {
      key: 'total_earnings',
      label: 'Total Earnings',
      render: (row) => (
        <span style={{ fontWeight: '600', color: '#059669' }}>
          ${((row.total_earnings_cents || 0) / 100).toLocaleString()}
        </span>
      )
    },
    {
      key: 'compliance_status',
      label: 'Compliance',
      render: (row) => <StatusBadge status={row.compliance_status} />
    },
    {
      key: 'quiz_completed',
      label: 'Quiz',
      render: (row) =>
        row.quiz_completed ? (
          <CheckCircle style={{ width: '20px', height: '20px', color: '#059669' }} />
        ) : (
          <XCircle style={{ width: '20px', height: '20px', color: '#d1d5db' }} />
        )
    },
    {
      key: 'readiness_status',
      label: 'Readiness',
      render: (row) => {
        if (!row.readiness_status) {
          return <span style={{ color: '#d1d5db' }}>-</span>;
        }
        const status = row.readiness_status;
        if (status === 'ready') {
          return <CheckCircle style={{ width: '20px', height: '20px', color: '#059669' }} />;
        } else if (status === 'partial') {
          return <AlertTriangle style={{ width: '20px', height: '20px', color: '#f59e0b' }} />;
        } else {
          return <XCircle style={{ width: '20px', height: '20px', color: '#ef4444' }} />;
        }
      }
    }
  ];

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100%' }}>
      <PageHeader
        title="Athletes"
        description={`${athletes.length} total athletes`}
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

      <div style={{ backgroundColor: 'white' }}>
        <DataTable
          columns={columns}
          data={athletes}
          onRowClick={handleRowClick}
          loading={loading}
          emptyState={
            <EmptyState
              icon={Users}
              title="No athletes found"
              description="No athlete data available for this period"
            />
          }
        />
      </div>

      {/* Athlete Detail Drawer */}
      {selectedAthlete && (
        <AthleteDetailDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          athlete={selectedAthlete}
          onUpdate={fetchAthletes}
        />
      )}
    </div>
  );
}

// Athlete Detail Drawer
function AthleteDetailDrawer({ isOpen, onClose, athlete, onUpdate }) {
  const [compliance, setCompliance] = useState({
    kyc_verified: false,
    kyc_verified_date: '',
    tax_docs_submitted: false,
    tax_docs_date: '',
    contract_signed: false,
    contract_signed_date: '',
    brand_approval: false,
    brand_approval_date: '',
    ready: false,
    ready_date: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (athlete) {
      // Initialize with existing data if available
      setCompliance({
        kyc_verified: athlete.kyc_verified || false,
        kyc_verified_date: athlete.kyc_verified_date || '',
        tax_docs_submitted: athlete.tax_docs_submitted || false,
        tax_docs_date: athlete.tax_docs_date || '',
        contract_signed: athlete.contract_signed || false,
        contract_signed_date: athlete.contract_signed_date || '',
        brand_approval: athlete.brand_approval || false,
        brand_approval_date: athlete.brand_approval_date || '',
        ready: athlete.ready || false,
        ready_date: athlete.ready_date || '',
        notes: athlete.notes || ''
      });
    }
  }, [athlete]);

  const handleCheckboxChange = (field) => {
    const newValue = !compliance[field];
    const dateField = `${field}_date`;
    
    setCompliance((prev) => ({
      ...prev,
      [field]: newValue,
      [dateField]: newValue ? new Date().toISOString() : ''
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateAthleteCompliance(athlete.athlete_id, compliance);
      alert('Compliance profile updated successfully');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Failed to update compliance:', error);
      alert('Failed to update compliance profile');
    } finally {
      setSaving(false);
    }
  };

  const checklistItems = [
    { key: 'kyc_verified', label: 'KYC Verified' },
    { key: 'tax_docs_submitted', label: 'Tax Documents Submitted' },
    { key: 'contract_signed', label: 'Contract Signed' },
    { key: 'brand_approval', label: 'Brand Approval Received' },
    { key: 'ready', label: 'Ready for Deals' }
  ];

  const completedCount = checklistItems.filter((item) => compliance[item.key]).length;
  const progress = (completedCount / checklistItems.length) * 100;

  return (
    <DrawerContainer
      isOpen={isOpen}
      onClose={onClose}
      title={`Athlete: ${athlete.athlete_name || 'Unknown'}`}
      size="md"
    >
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Summary Stats */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '16px' 
        }}>
          <div style={{
            backgroundColor: '#dbeafe',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #bfdbfe'
          }}>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 8px 0' }}>
              Active Deals
            </p>
            <p style={{ fontSize: '28px', fontWeight: '700', color: '#3b82f6', margin: 0 }}>
              {athlete.active_deals || 0}
            </p>
          </div>
          <div style={{
            backgroundColor: '#ecfdf5',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #a7f3d0'
          }}>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 8px 0' }}>
              Total Earnings
            </p>
            <p style={{ fontSize: '28px', fontWeight: '700', color: '#059669', margin: 0 }}>
              ${((athlete.total_earnings_cents || 0) / 100).toLocaleString()}
            </p>
          </div>
          <div style={{
            backgroundColor: '#faf5ff',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #e9d5ff'
          }}>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 8px 0' }}>
              Compliance
            </p>
            <StatusBadge status={athlete.compliance_status} />
          </div>
        </div>

        {/* Readiness Checklist */}
        <div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#111827',
              margin: 0,
              letterSpacing: '-0.01em'
            }}>
              Readiness Checklist
            </h3>
            <span style={{ 
              fontSize: '14px', 
              color: '#6b7280',
              fontWeight: '500'
            }}>
              {completedCount} / {checklistItems.length} completed
            </span>
          </div>

          {/* Progress Bar */}
          <div style={{ 
            marginBottom: '20px', 
            backgroundColor: '#e5e7eb', 
            borderRadius: '999px',
            height: '8px',
            overflow: 'hidden'
          }}>
            <div
              style={{ 
                backgroundColor: '#059669',
                height: '100%',
                borderRadius: '999px',
                transition: 'width 0.3s ease',
                width: `${progress}%`
              }}
            />
          </div>

          {/* Checklist Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {checklistItems.map((item) => (
              <div
                key={item.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="checkbox"
                    checked={compliance[item.key]}
                    onChange={() => handleCheckboxChange(item.key)}
                    style={{
                      width: '20px',
                      height: '20px',
                      cursor: 'pointer',
                      accentColor: '#059669'
                    }}
                  />
                  <label style={{ 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#111827',
                    cursor: 'pointer'
                  }}>
                    {item.label}
                  </label>
                </div>
                {compliance[item.key] && compliance[`${item.key}_date`] && (
                  <span style={{ 
                    fontSize: '12px', 
                    color: '#6b7280',
                    fontWeight: '500'
                  }}>
                    {format(new Date(compliance[`${item.key}_date`]), 'MMM d, yyyy')}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '8px'
          }}>
            Notes
          </label>
          <textarea
            value={compliance.notes}
            onChange={(e) =>
              setCompliance((prev) => ({ ...prev, notes: e.target.value }))
            }
            placeholder="Add any additional notes about this athlete..."
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '12px',
              resize: 'none',
              fontSize: '14px',
              fontFamily: 'inherit',
              lineHeight: '1.5'
            }}
            rows={4}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
        </div>
      </div>
    </DrawerContainer>
  );
}
