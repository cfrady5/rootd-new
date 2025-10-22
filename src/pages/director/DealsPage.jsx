import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Download, Filter, Search } from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';
import {
  getDeals,
  getDealById,
  getDealMessages,
  getDealTasks,
  createDealMessage,
  createDealTask,
  updateDealTask,
  exportDealsToCsv
} from '../../lib/api/directorComplete';
import {
  PageHeader,
  DataTable,
  Pagination,
  StatusBadge,
  LoadingSpinner,
  EmptyState,
  DrawerContainer,
  Tabs,
  FilterBar,
  Select,
  TextInput,
  Button
} from '../../components/director/PremiumComponents';
import { Handshake } from 'lucide-react';

export default function DealsPage() {
  const { session } = useAuth();
  const orgId = session?.user?.org_id || '00000000-0000-0000-0000-000000000000';

  const [filters, setFilters] = useState({
    status: '',
    athlete: '',
    brand: '',
    startDate: '',
    endDate: '',
    sortBy: 'created_at',
    sortDesc: true
  });
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [deals, setDeals] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Fetch deals
  useEffect(() => {
    fetchDeals();
  }, [page, filters]);

  const fetchDeals = async () => {
    setLoading(true);
    try {
      const result = await getDeals(orgId, {
        page,
        pageSize,
        ...filters
      });
      setDeals(result.data || []);
      setTotalCount(result.count || 0);
    } catch (error) {
      console.error('Failed to fetch deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = async (deal) => {
    try {
      const fullDeal = await getDealById(deal.id);
      setSelectedDeal(fullDeal);
      setDrawerOpen(true);
    } catch (error) {
      console.error('Failed to fetch deal details:', error);
    }
  };

  const handleExport = async () => {
    try {
      const result = await exportDealsToCsv(orgId, filters);
      window.open(result.url, '_blank');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export CSV');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      athlete: '',
      brand: '',
      startDate: '',
      endDate: '',
      sortBy: 'created_at',
      sortDesc: true
    });
    setPage(1);
  };

  const columns = [
    {
      key: 'deal_name',
      label: 'Deal Name',
      render: (row) => (
        <div>
          <p style={{ fontWeight: '600', color: '#111827', margin: 0 }}>{row.deal_name}</p>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>{row.id.slice(0, 8)}</p>
        </div>
      )
    },
    {
      key: 'athlete',
      label: 'Athlete',
      render: (row) => row.athlete_name || row.athlete_id?.slice(0, 8) || '-'
    },
    {
      key: 'brand',
      label: 'Brand',
      render: (row) => row.brand_name || '-'
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.deal_status} />
    },
    {
      key: 'payout',
      label: 'Payout',
      render: (row) => (
        <span style={{ fontWeight: '600', color: '#059669' }}>
          ${((row.payout_total_cents || 0) / 100).toLocaleString()}
        </span>
      )
    },
    {
      key: 'compliance',
      label: 'Compliance',
      render: (row) => <StatusBadge status={row.compliance_status} />
    },
    {
      key: 'created',
      label: 'Created',
      render: (row) => format(new Date(row.created_at), 'MMM d, yyyy')
    }
  ];

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <>
      <PageHeader
        title="Deals"
        description={`${totalCount} total deals`}
        actions={
          <Button onClick={handleExport} variant="secondary" icon={Download}>
            Export CSV
          </Button>
        }
      />

      <FilterBar>
        <TextInput
          placeholder="Search athlete..."
          value={filters.athlete}
          onChange={(val) => handleFilterChange('athlete', val)}
        />
        <TextInput
          placeholder="Search brand..."
          value={filters.brand}
          onChange={(val) => handleFilterChange('brand', val)}
        />
        <Select
          placeholder="All statuses"
          value={filters.status}
          onChange={(val) => handleFilterChange('status', val)}
          options={[
            { value: 'active', label: 'Active' },
            { value: 'negotiation', label: 'Negotiation' },
            { value: 'approved', label: 'Approved' },
            { value: 'executed', label: 'Executed' },
            { value: 'pending_payment', label: 'Pending Payment' },
            { value: 'completed', label: 'Completed' },
            { value: 'cancelled', label: 'Cancelled' }
          ]}
        />
        <TextInput
          type="date"
          placeholder="Start date"
          value={filters.startDate}
          onChange={(val) => handleFilterChange('startDate', val)}
        />
        <TextInput
          type="date"
          placeholder="End date"
          value={filters.endDate}
          onChange={(val) => handleFilterChange('endDate', val)}
        />
        {(filters.status || filters.athlete || filters.brand || filters.startDate || filters.endDate) && (
          <Button onClick={clearFilters} variant="ghost" size="sm">
            Clear Filters
          </Button>
        )}
      </FilterBar>

      <div className="bg-white">
        <DataTable
          columns={columns}
          data={deals}
          onRowClick={handleRowClick}
          loading={loading}
          emptyState={
            <EmptyState
              icon={Handshake}
              title="No deals found"
              description="Try adjusting your filters"
            />
          }
        />
        {totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
      </div>

      {/* Deal Detail Drawer */}
      {selectedDeal && (
        <DealDetailDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          deal={selectedDeal}
          orgId={orgId}
        />
      )}
    </>
  );
}

// Deal Detail Drawer Component
function DealDetailDrawer({ isOpen, onClose, deal, orgId }) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <DrawerContainer
      isOpen={isOpen}
      onClose={onClose}
      title={deal.deal_name}
      size="lg"
    >
      <Tabs
        tabs={[
          { key: 'overview', label: 'Overview' },
          { key: 'messages', label: 'Messages' },
          { key: 'tasks', label: 'Tasks' }
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      <div className="p-6">
        {activeTab === 'overview' && <DealOverviewTab deal={deal} />}
        {activeTab === 'messages' && <DealMessagesTab dealId={deal.id} orgId={orgId} />}
        {activeTab === 'tasks' && <DealTasksTab dealId={deal.id} orgId={orgId} />}
      </div>
    </DrawerContainer>
  );
}

// Overview Tab
function DealOverviewTab({ deal }) {
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ 
          fontSize: '13px', 
          fontWeight: '600', 
          color: '#6b7280', 
          marginBottom: '16px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          Deal Information
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '24px'
        }}>
          <div>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 8px 0' }}>Status</p>
            <StatusBadge status={deal.deal_status} />
          </div>
          <div>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 8px 0' }}>Compliance</p>
            <StatusBadge status={deal.compliance_status} />
          </div>
          <div>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 8px 0' }}>Total Payout</p>
            <p style={{ fontSize: '18px', fontWeight: '600', color: '#059669', margin: 0 }}>
              ${((deal.payout_total_cents || 0) / 100).toLocaleString()}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 8px 0' }}>Paid to Date</p>
            <p style={{ fontSize: '18px', fontWeight: '600', color: '#3b82f6', margin: 0 }}>
              ${((deal.paid_to_date_cents || 0) / 100).toLocaleString()}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 8px 0' }}>Athlete</p>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: 0 }}>
              {deal.athlete_name || 'N/A'}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 8px 0' }}>Brand</p>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: 0 }}>
              {deal.brand_name || 'N/A'}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 8px 0' }}>Created</p>
            <p style={{ fontSize: '14px', color: '#374151', margin: 0 }}>
              {format(new Date(deal.created_at), 'MMM d, yyyy')}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 8px 0' }}>Last Updated</p>
            <p style={{ fontSize: '14px', color: '#374151', margin: 0 }}>
              {format(new Date(deal.updated_at), 'MMM d, yyyy')}
            </p>
          </div>
        </div>
      </div>

      {deal.compliance_notes && (
        <div>
          <h3 style={{ 
            fontSize: '13px', 
            fontWeight: '600', 
            color: '#6b7280', 
            marginBottom: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Compliance Notes
          </h3>
          <p style={{ 
            fontSize: '14px', 
            color: '#92400e', 
            backgroundColor: '#fef3c7', 
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid #fde68a',
            margin: 0,
            lineHeight: '1.6'
          }}>
            {deal.compliance_notes}
          </p>
        </div>
      )}
    </div>
  );
}

// Messages Tab
function DealMessagesTab({ dealId, orgId }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, [dealId]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const data = await getDealMessages(dealId, 50);
      setMessages(data || []);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      await createDealMessage(dealId, orgId, newMessage);
      setNewMessage('');
      await fetchMessages();
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '48px 0' }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ 
        maxHeight: '400px', 
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {messages.length === 0 ? (
          <p style={{ 
            fontSize: '14px', 
            color: '#6b7280', 
            textAlign: 'center', 
            padding: '32px 0' 
          }}>
            No messages yet
          </p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} style={{
              backgroundColor: '#f9fafb',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                justifyContent: 'space-between',
                marginBottom: '8px'
              }}>
                <p style={{ 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#111827',
                  margin: 0
                }}>
                  {msg.author_name || 'Unknown'}
                </p>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                  {format(new Date(msg.created_at), 'MMM d, h:mm a')}
                </p>
              </div>
              <p style={{ fontSize: '14px', color: '#374151', margin: 0, lineHeight: '1.5' }}>
                {msg.content}
              </p>
              {msg.attachments && msg.attachments.length > 0 && (
                <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {msg.attachments.map((att, idx) => (
                    <a
                      key={idx}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '12px',
                        color: '#3b82f6',
                        textDecoration: 'underline',
                        fontWeight: '500'
                      }}
                    >
                      {att.filename}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
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
          rows={3}
        />
        <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={handleSend} disabled={!newMessage.trim() || sending}>
            {sending ? 'Sending...' : 'Send Message'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Tasks Tab
function DealTasksTab({ dealId, orgId }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    kind: 'approval',
    due_at: ''
  });

  useEffect(() => {
    fetchTasks();
  }, [dealId]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await getDealTasks(dealId);
      setTasks(data || []);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return;

    try {
      await createDealTask(dealId, orgId, newTask);
      setNewTask({ title: '', description: '', kind: 'approval', due_at: '' });
      setShowNewTask(false);
      await fetchTasks();
    } catch (error) {
      console.error('Failed to create task:', error);
      alert('Failed to create task');
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      await updateDealTask(taskId, updates);
      await fetchTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
      alert('Failed to update task');
    }
  };

  const tasksByStatus = {
    todo: tasks.filter(t => t.status === 'todo'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    done: tasks.filter(t => t.status === 'done')
  };

  if (loading) {
    return (
      <div className="py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-900">Tasks</h3>
        <Button onClick={() => setShowNewTask(!showNewTask)} size="sm">
          {showNewTask ? 'Cancel' : 'Add Task'}
        </Button>
      </div>

      {showNewTask && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <TextInput
            label="Title"
            value={newTask.title}
            onChange={(val) => setNewTask(prev => ({ ...prev, title: val }))}
            placeholder="Task title"
          />
          <TextInput
            label="Description"
            value={newTask.description}
            onChange={(val) => setNewTask(prev => ({ ...prev, description: val }))}
            placeholder="Task description"
          />
          <Select
            label="Type"
            value={newTask.kind}
            onChange={(val) => setNewTask(prev => ({ ...prev, kind: val }))}
            options={[
              { value: 'approval', label: 'Approval' },
              { value: 'compliance_check', label: 'Compliance Check' },
              { value: 'payment', label: 'Payment' },
              { value: 'document', label: 'Document' },
              { value: 'follow_up', label: 'Follow Up' },
              { value: 'other', label: 'Other' }
            ]}
          />
          <TextInput
            label="Due Date"
            type="date"
            value={newTask.due_at}
            onChange={(val) => setNewTask(prev => ({ ...prev, due_at: val }))}
          />
          <Button onClick={handleCreateTask}>Create Task</Button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {['todo', 'in_progress', 'done'].map((status) => (
          <div key={status} className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 capitalize">
              {status.replace('_', ' ')} ({tasksByStatus[status].length})
            </h4>
            <div className="space-y-2">
              {tasksByStatus[status].map((task) => (
                <div key={task.id} className="bg-white border border-gray-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-900">{task.title}</p>
                  {task.description && (
                    <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    <StatusBadge status={task.kind} />
                    {task.is_overdue && (
                      <span className="text-xs text-red-600">Overdue</span>
                    )}
                  </div>
                  {status !== 'done' && (
                    <div className="mt-2 flex gap-1">
                      {status === 'todo' && (
                        <button
                          onClick={() => handleUpdateTask(task.id, { status: 'in_progress' })}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Start
                        </button>
                      )}
                      {status === 'in_progress' && (
                        <button
                          onClick={() =>
                            handleUpdateTask(task.id, {
                              status: 'done',
                              completed_at: new Date().toISOString()
                            })
                          }
                          className="text-xs text-emerald-600 hover:text-emerald-800"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
