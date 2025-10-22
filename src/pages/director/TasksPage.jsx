import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CheckSquare, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';
import { getDeals, getDealTasks, updateDealTask } from '../../lib/api/directorComplete';
import {
  PageHeader,
  DataTable,
  StatusBadge,
  LoadingSpinner,
  EmptyState,
  Select,
  StatCard
} from '../../components/director/PremiumComponents';

export default function TasksPage() {
  const { session } = useAuth();
  const orgId = session?.user?.org_id || '00000000-0000-0000-0000-000000000000';

  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterKind, setFilterKind] = useState('');

  useEffect(() => {
    fetchAllTasks();
  }, []);

  const fetchAllTasks = async () => {
    setLoading(true);
    try {
      // First get all active deals
      const { data: deals } = await getDeals(orgId, {
        page: 1,
        pageSize: 100,
        status: 'active'
      });

      // Then fetch tasks for each deal
      const taskPromises = deals.map((deal) =>
        getDealTasks(deal.id).then((tasks) =>
          tasks.map((task) => ({
            ...task,
            deal_name: deal.deal_name,
            deal_id: deal.id
          }))
        )
      );

      const tasksArrays = await Promise.all(taskPromises);
      const tasks = tasksArrays.flat();
      setAllTasks(tasks);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      await updateDealTask(taskId, updates);
      await fetchAllTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
      alert('Failed to update task');
    }
  };

  const filteredTasks = allTasks.filter((task) => {
    if (filterStatus && task.status !== filterStatus) return false;
    if (filterKind && task.kind !== filterKind) return false;
    return true;
  });

  const todoCount = allTasks.filter((t) => t.status === 'todo').length;
  const inProgressCount = allTasks.filter((t) => t.status === 'in_progress').length;
  const overdueCount = allTasks.filter((t) => t.is_overdue).length;

  const columns = [
    {
      key: 'title',
      label: 'Task',
      render: (row) => (
        <div>
          <p className="font-medium">{row.title}</p>
          <p className="text-xs text-gray-500">{row.deal_name}</p>
        </div>
      )
    },
    {
      key: 'kind',
      label: 'Type',
      render: (row) => <StatusBadge status={row.kind} />
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      key: 'assignee',
      label: 'Assignee',
      render: (row) => row.assignee_name || 'Unassigned'
    },
    {
      key: 'due_at',
      label: 'Due Date',
      render: (row) => {
        if (!row.due_at) return '-';
        const isOverdue = row.is_overdue;
        return (
          <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
            {format(new Date(row.due_at), 'MMM d, yyyy')}
            {isOverdue && ' (Overdue)'}
          </span>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => {
        if (row.status === 'done') return null;
        
        return (
          <div className="flex gap-2">
            {row.status === 'todo' && (
              <button
                onClick={() => handleUpdateTask(row.id, { status: 'in_progress' })}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Start
              </button>
            )}
            {row.status === 'in_progress' && (
              <button
                onClick={() =>
                  handleUpdateTask(row.id, {
                    status: 'done',
                    completed_at: new Date().toISOString()
                  })
                }
                className="text-xs text-emerald-600 hover:text-emerald-800 font-medium"
              >
                Complete
              </button>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100%' }}>
      <PageHeader
        title="Tasks"
        description="Manage tasks across all deals"
      />

      <div style={{ padding: '32px' }}>
        {/* Summary Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '24px',
          marginBottom: '32px'
        }}>
          <StatCard label="To Do" value={todoCount} icon={CheckSquare} loading={loading} />
          <StatCard
            label="In Progress"
            value={inProgressCount}
            icon={Clock}
            loading={loading}
          />
          <StatCard
            label="Overdue"
            value={overdueCount}
            icon={AlertCircle}
            loading={loading}
          />
        </div>

        {/* Filters and Table */}
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
                value={filterStatus}
                onChange={setFilterStatus}
                options={[
                  { value: 'todo', label: 'To Do' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'blocked', label: 'Blocked' },
                  { value: 'done', label: 'Done' }
                ]}
              />
              <Select
                placeholder="All types"
                value={filterKind}
                onChange={setFilterKind}
                options={[
                  { value: 'approval', label: 'Approval' },
                  { value: 'compliance_check', label: 'Compliance Check' },
                  { value: 'payment', label: 'Payment' },
                  { value: 'document', label: 'Document' },
                  { value: 'follow_up', label: 'Follow Up' },
                  { value: 'other', label: 'Other' }
                ]}
              />
              {(filterStatus || filterKind) && (
                <button
                  onClick={() => {
                    setFilterStatus('');
                    setFilterKind('');
                  }}
                  className="text-sm text-emerald-600 hover:text-emerald-700"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          <DataTable
            columns={columns}
            data={filteredTasks}
            loading={loading}
            emptyState={
              <EmptyState
                icon={CheckSquare}
                title="No tasks found"
                description={
                  filterStatus || filterKind
                    ? 'Try adjusting your filters'
                    : 'No tasks available'
                }
              />
            }
          />
        </div>
      </div>
    </div>
  );
}
