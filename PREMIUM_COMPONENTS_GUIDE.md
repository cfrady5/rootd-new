# Premium Components - Quick Reference Guide

## Import

```jsx
import {
  PageHeader,
  LoadingSpinner,
  EmptyState,
  DataTable,
  Pagination,
  StatusBadge,
  StatCard,
  DrawerContainer,
  Tabs,
  FilterBar,
  Select,
  TextInput,
  Button
} from '../../components/director/PremiumComponents';

// Import icons from lucide-react
import { DollarSign, AlertTriangle, Handshake, TrendingUp, Download } from 'lucide-react';
```

---

## Components

### PageHeader
**Purpose:** Page title with optional description and action buttons

```jsx
<PageHeader
  title="Dashboard"
  description="Overview of all deals and metrics"
  actions={
    <Button onClick={handleExport} variant="secondary" icon={Download}>
      Export
    </Button>
  }
/>
```

**Props:**
- `title` (string, required) - Page title
- `description` (string, optional) - Subtitle text
- `actions` (ReactNode, optional) - Action buttons rendered on the right

**Animations:** Fade in from top (y: -10 → 0)

---

### StatCard
**Purpose:** Display a KPI with icon, value, and optional trend

```jsx
<StatCard
  label="Total Revenue"
  value="$125,000"
  icon={DollarSign}
  change={12.5}
  trend="up"
  loading={false}
/>
```

**Props:**
- `label` (string, required) - Metric label (appears uppercase)
- `value` (string/number, required) - Main value to display
- `icon` (LucideIcon, optional) - Icon component from lucide-react
- `change` (number, optional) - Percentage change (e.g., 12.5 for +12.5%)
- `trend` ("up" | "down", optional) - Trend direction for color coding
- `loading` (boolean, optional) - Shows spinner when true

**Animations:**
- Fade in from bottom (y: 20 → 0)
- Icon rotates in with spring physics
- Hover: lift effect (y: -4px) with enhanced shadow

**Colors:**
- Icon background: gradient emerald-50 → emerald-100
- Trend up: green (#059669)
- Trend down: red (#dc2626)

---

### DataTable
**Purpose:** Display tabular data with hover effects and row clicks

```jsx
const columns = [
  {
    key: 'name',
    label: 'Name',
    render: (row) => <span style={{ fontWeight: '600' }}>{row.name}</span>
  },
  {
    key: 'status',
    label: 'Status',
    render: (row) => <StatusBadge status={row.status} />
  }
];

<DataTable
  columns={columns}
  data={deals}
  onRowClick={handleRowClick}
  loading={loading}
  emptyState={<EmptyState icon={Handshake} title="No deals" />}
/>
```

**Props:**
- `columns` (array, required) - Column definitions with `key`, `label`, `render`
- `data` (array, required) - Array of data objects
- `onRowClick` (function, optional) - Called with row data on click
- `loading` (boolean, optional) - Shows spinner when true
- `emptyState` (ReactNode, optional) - Custom empty state component

**Animations:**
- Each row fades in with stagger (0.03s delay per row)
- Hover: background change, scale (1.002x), shadow

---

### Pagination
**Purpose:** Navigate between pages of data

```jsx
<Pagination
  currentPage={page}
  totalPages={totalPages}
  onPageChange={setPage}
/>
```

**Props:**
- `currentPage` (number, required) - Current page (1-indexed)
- `totalPages` (number, required) - Total number of pages
- `onPageChange` (function, required) - Called with new page number

**Features:**
- Shows max 5 page numbers
- Previous/Next buttons
- Active page highlighted in emerald
- Hover and tap animations on buttons

---

### StatusBadge
**Purpose:** Display status with color-coded badge

```jsx
<StatusBadge status="active" />
<StatusBadge status="completed" />
<StatusBadge status="fail" />
```

**Props:**
- `status` (string, required) - Status key

**Supported Statuses:**
- Deal statuses: active, negotiation, approved, executed, pending_payment, completed, cancelled
- Compliance: pass, warning, fail, pending
- Task: todo, in_progress, blocked, done

**Colors:**
- Active/Pass: green
- Warning/Negotiation: yellow
- Fail/Cancelled: red
- Completed/Done: gray
- In Progress: blue

**Animations:** Scale in (0.9 → 1)

---

### DrawerContainer
**Purpose:** Side panel for detailed views

```jsx
<DrawerContainer
  isOpen={isOpen}
  onClose={onClose}
  title="Deal Details"
  size="lg"
>
  <Tabs tabs={tabConfig} activeTab={activeTab} onChange={setActiveTab} />
  <div style={{ padding: '24px' }}>
    {/* content */}
  </div>
</DrawerContainer>
```

**Props:**
- `isOpen` (boolean, required) - Controls visibility
- `onClose` (function, required) - Called when closing
- `title` (string, required) - Drawer title
- `size` ("sm" | "md" | "lg" | "xl", optional) - Width (400, 600, 800, 1000px)
- `children` (ReactNode, required) - Drawer content

**Animations:**
- Backdrop: fade in with blur(4px)
- Drawer: spring slide from right (damping: 30, stiffness: 300)
- Close button: rotate 90° on hover

---

### Tabs
**Purpose:** Tabbed navigation within a panel

```jsx
<Tabs
  tabs={[
    { key: 'overview', label: 'Overview' },
    { key: 'messages', label: 'Messages' },
    { key: 'tasks', label: 'Tasks' }
  ]}
  activeTab={activeTab}
  onChange={setActiveTab}
/>
```

**Props:**
- `tabs` (array, required) - Tab definitions with `key` and `label`
- `activeTab` (string, required) - Currently active tab key
- `onChange` (function, required) - Called with new tab key

**Animations:** Underline slides with layoutId (smooth Framer Motion transition)

---

### Button
**Purpose:** Interactive button with variants

```jsx
<Button onClick={handleClick} variant="primary" size="md" icon={Download}>
  Export CSV
</Button>
```

**Props:**
- `onClick` (function, required) - Click handler
- `variant` ("primary" | "secondary" | "danger" | "ghost", optional) - Style variant
- `size` ("sm" | "md" | "lg", optional) - Button size
- `disabled` (boolean, optional) - Disabled state
- `icon` (LucideIcon, optional) - Icon to show before text
- `children` (ReactNode, required) - Button text

**Variants:**
- Primary: emerald background, white text
- Secondary: white background, gray text, border
- Danger: red background, white text
- Ghost: transparent, gray text

**Animations:**
- Hover: scale (1.02x), background color change
- Tap: scale (0.98x)

---

### Select
**Purpose:** Dropdown select input

```jsx
<Select
  label="Status"
  value={selectedStatus}
  onChange={setSelectedStatus}
  placeholder="All statuses"
  options={[
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' }
  ]}
/>
```

**Props:**
- `label` (string, optional) - Input label
- `value` (string, required) - Selected value
- `onChange` (function, required) - Called with new value
- `placeholder` (string, optional) - Placeholder text
- `options` (array, required) - Options with `value` and `label`

---

### TextInput
**Purpose:** Text input field

```jsx
<TextInput
  label="Search"
  value={searchQuery}
  onChange={setSearchQuery}
  placeholder="Type to search..."
  type="text"
/>
```

**Props:**
- `label` (string, optional) - Input label
- `value` (string, required) - Input value
- `onChange` (function, required) - Called with new value
- `placeholder` (string, optional) - Placeholder text
- `type` (string, optional) - Input type (default: "text")

---

### FilterBar
**Purpose:** Container for filter inputs

```jsx
<FilterBar>
  <TextInput placeholder="Search..." value={q} onChange={setQ} />
  <Select value={status} onChange={setStatus} options={statusOptions} />
  <Button onClick={clearFilters} variant="ghost">Clear</Button>
</FilterBar>
```

**Props:**
- `children` (ReactNode, required) - Filter inputs and buttons

**Styling:** Light gray background, 12px gap between children

---

### EmptyState
**Purpose:** Beautiful empty state with icon

```jsx
<EmptyState
  icon={Handshake}
  title="No deals found"
  description="Try adjusting your filters or create a new deal"
  action={<Button onClick={handleCreate}>Create Deal</Button>}
/>
```

**Props:**
- `icon` (LucideIcon, optional) - Icon component
- `title` (string, required) - Main heading
- `description` (string, optional) - Description text
- `action` (ReactNode, optional) - CTA button

**Animations:**
- Container: fade in with scale (0.95 → 1)
- Icon: scale in with spring physics

---

### LoadingSpinner
**Purpose:** Loading indicator

```jsx
<LoadingSpinner size="md" />
```

**Props:**
- `size` ("sm" | "md" | "lg", optional) - Spinner size (20, 40, 60px)

**Animations:** Continuous rotation (1s linear)

---

## Best Practices

### 1. Use Proper Icons
```jsx
// ❌ Don't use text
<StatCard icon="$" />

// ✅ Use lucide-react components
import { DollarSign } from 'lucide-react';
<StatCard icon={DollarSign} />
```

### 2. Consistent Styling
```jsx
// ❌ Don't mix Tailwind classes
<div className="bg-white p-4 rounded">

// ✅ Use inline styles
<div style={{
  backgroundColor: 'white',
  padding: '24px',
  borderRadius: '16px'
}}>
```

### 3. Loading States
```jsx
// ✅ Always provide loading states
{loading ? (
  <LoadingSpinner />
) : (
  <DataTable ... />
)}
```

### 4. Empty States
```jsx
// ✅ Always provide helpful empty states
<DataTable
  emptyState={
    <EmptyState
      icon={Icon}
      title="No items"
      description="Get started by creating your first item"
    />
  }
/>
```

### 5. Animations
```jsx
// ✅ Use Framer Motion for custom animations
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.1 }}
>
```

---

## Common Patterns

### Page Layout
```jsx
<div style={{ backgroundColor: '#f9fafb', minHeight: '100%' }}>
  <PageHeader title="Page Title" description="Description" />
  
  <FilterBar>
    {/* filters */}
  </FilterBar>
  
  <div style={{ padding: '32px' }}>
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
      gap: '24px' 
    }}>
      {/* stat cards */}
    </div>
    
    {/* main content */}
  </div>
</div>
```

### Card Styling
```jsx
<div style={{
  backgroundColor: 'white',
  borderRadius: '16px',
  padding: '28px',
  border: '1px solid #f3f4f6',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
}}>
  {/* content */}
</div>
```

### Section Heading
```jsx
<h3 style={{
  fontSize: '18px',
  fontWeight: '600',
  color: '#111827',
  margin: '0 0 20px 0',
  letterSpacing: '-0.01em'
}}>
  Section Title
</h3>
```

### Label
```jsx
<p style={{
  fontSize: '13px',
  fontWeight: '600',
  color: '#6b7280',
  marginBottom: '8px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
}}>
  Label Text
</p>
```

---

## Color Reference

```jsx
// Brand
const emerald = {
  primary: '#059669',
  hover: '#047857',
  light: '#ecfdf5',
  lighter: '#d1fae5'
};

// Grays
const grays = {
  heading: '#111827',
  body: '#374151',
  secondary: '#6b7280',
  border: '#e5e7eb',
  divider: '#f3f4f6',
  background: '#f9fafb'
};

// Status
const status = {
  success: '#10b981',
  info: '#3b82f6',
  warning: '#f59e0b',
  danger: '#ef4444'
};
```

---

## Spacing Scale

```jsx
const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  base: '16px',
  lg: '20px',
  xl: '24px',
  '2xl': '32px'
};
```

---

**Need Help?** Check `DIRECTOR_UI_VISUAL_COMPARISON.md` for before/after examples.
