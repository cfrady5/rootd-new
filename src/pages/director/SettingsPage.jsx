import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Settings, Users, FileText } from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';
import {
  getOrgMembers,
  getAuditLog,
  createOrgMember,
  updateOrgMemberRole
} from '../../lib/api/directorComplete';
import {
  PageHeader,
  DataTable,
  Pagination,
  StatusBadge,
  LoadingSpinner,
  EmptyState,
  Tabs,
  Button,
  TextInput,
  Select
} from '../../components/director/PremiumComponents';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('members');

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage organization settings, members, and audit logs"
      />

      <Tabs
        tabs={[
          { key: 'members', label: 'Team Members' },
          { key: 'audit', label: 'Audit Log' },
          { key: 'reports', label: 'Reports' }
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      <div className="p-6">
        {activeTab === 'members' && <MembersTab />}
        {activeTab === 'audit' && <AuditLogTab />}
        {activeTab === 'reports' && <ReportsTab />}
      </div>
    </>
  );
}

// Members Tab
function MembersTab() {
  const { session } = useAuth();
  const orgId = session?.user?.org_id || '00000000-0000-0000-0000-000000000000';

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({ userId: '', role: 'director' });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const data = await getOrgMembers(orgId);
      setMembers(data || []);
    } catch (error) {
      console.error('Failed to fetch members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMember.userId) return;

    try {
      await createOrgMember(orgId, newMember.userId, newMember.role);
      setNewMember({ userId: '', role: 'director' });
      setShowAddMember(false);
      await fetchMembers();
    } catch (error) {
      console.error('Failed to add member:', error);
      alert('Failed to add member');
    }
  };

  const handleUpdateRole = async (memberId, newRole) => {
    try {
      await updateOrgMemberRole(memberId, newRole);
      await fetchMembers();
    } catch (error) {
      console.error('Failed to update role:', error);
      alert('Failed to update role');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (row) => (
        <div>
          <p className="font-medium">{row.profile?.full_name || 'Unknown'}</p>
          <p className="text-xs text-gray-500">{row.profile?.email || '-'}</p>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Role',
      render: (row) => <StatusBadge status={row.role} />
    },
    {
      key: 'joined',
      label: 'Joined',
      render: (row) =>
        row.joined_at ? format(new Date(row.joined_at), 'MMM d, yyyy') : 'Pending'
    },
    {
      key: 'invited_by',
      label: 'Invited By',
      render: (row) => row.invited_by?.slice(0, 8) || '-'
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <Select
          value={row.role}
          onChange={(val) => handleUpdateRole(row.id, val)}
          options={[
            { value: 'admin', label: 'Admin' },
            { value: 'director', label: 'Director' },
            { value: 'viewer', label: 'Viewer' }
          ]}
        />
      )
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
        <Button onClick={() => setShowAddMember(!showAddMember)} size="sm">
          {showAddMember ? 'Cancel' : 'Add Member'}
        </Button>
      </div>

      {showAddMember && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <TextInput
            label="User ID"
            value={newMember.userId}
            onChange={(val) => setNewMember((prev) => ({ ...prev, userId: val }))}
            placeholder="Enter user ID"
          />
          <Select
            label="Role"
            value={newMember.role}
            onChange={(val) => setNewMember((prev) => ({ ...prev, role: val }))}
            options={[
              { value: 'admin', label: 'Admin' },
              { value: 'director', label: 'Director' },
              { value: 'viewer', label: 'Viewer' }
            ]}
          />
          <Button onClick={handleAddMember}>Add Member</Button>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg">
        <DataTable
          columns={columns}
          data={members}
          loading={loading}
          emptyState={
            <EmptyState
              icon={Users}
              title="No members"
              description="No team members found"
            />
          }
        />
      </div>
    </div>
  );
}

// Audit Log Tab
function AuditLogTab() {
  const { session } = useAuth();
  const orgId = session?.user?.org_id || '00000000-0000-0000-0000-000000000000';

  const [logs, setLogs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('');

  useEffect(() => {
    fetchAuditLog();
  }, [page, filterAction]);

  const fetchAuditLog = async () => {
    setLoading(true);
    try {
      const result = await getAuditLog(orgId, {
        page,
        pageSize: 50,
        action: filterAction || undefined
      });
      setLogs(result.data || []);
      setTotalCount(result.count || 0);
    } catch (error) {
      console.error('Failed to fetch audit log:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'action',
      label: 'Action',
      render: (row) => <StatusBadge status={row.action} />
    },
    {
      key: 'user',
      label: 'User',
      render: (row) => row.user_id?.slice(0, 8) || 'System'
    },
    {
      key: 'subject',
      label: 'Subject',
      render: (row) => (
        <div>
          <p className="text-sm">{row.subject_type || '-'}</p>
          <p className="text-xs text-gray-500">{row.subject_id?.slice(0, 8) || '-'}</p>
        </div>
      )
    },
    {
      key: 'meta',
      label: 'Details',
      render: (row) => (
        <pre className="text-xs text-gray-600 max-w-xs truncate">
          {row.meta ? JSON.stringify(row.meta) : '-'}
        </pre>
      )
    },
    {
      key: 'created_at',
      label: 'Timestamp',
      render: (row) => format(new Date(row.created_at), 'MMM d, yyyy h:mm a')
    }
  ];

  const totalPages = Math.ceil(totalCount / 50);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Audit Log</h3>
        <Select
          placeholder="All actions"
          value={filterAction}
          onChange={setFilterAction}
          options={[
            { value: 'task_created', label: 'Task Created' },
            { value: 'task_completed', label: 'Task Completed' },
            { value: 'compliance_updated', label: 'Compliance Updated' },
            { value: 'member_added', label: 'Member Added' },
            { value: 'member_role_changed', label: 'Role Changed' }
          ]}
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-lg">
        <DataTable
          columns={columns}
          data={logs}
          loading={loading}
          emptyState={
            <EmptyState
              icon={FileText}
              title="No audit logs"
              description="No activity recorded yet"
            />
          }
        />
        {totalPages > 1 && (
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        )}
      </div>
    </div>
  );
}

// Reports Tab
function ReportsTab() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Scheduled Reports</h3>
      <div className="bg-white border border-gray-200 rounded-lg p-12">
        <EmptyState
          icon={FileText}
          title="Reports Coming Soon"
          description="Scheduled reports and exports will be available in a future update"
        />
      </div>
    </div>
  );
}
