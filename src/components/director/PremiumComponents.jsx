// Premium Shared Components - Apple-level Design

import { motion, AnimatePresence } from 'framer-motion';

// Page Header - Premium design with smooth fade-in
export function PageHeader({ title, description, actions }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #f3f4f6',
        padding: '24px 32px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#111827',
            margin: 0,
            letterSpacing: '-0.02em'
          }}>
            {title}
          </h1>
          {description && (
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: '6px 0 0 0',
              fontWeight: '400'
            }}>
              {description}
            </p>
          )}
        </div>
        {actions && <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>{actions}</div>}
      </div>
    </motion.div>
  );
}

// Loading Spinner - Premium animation
export function LoadingSpinner({ size = 'md' }) {
  const sizeMap = { sm: 20, md: 40, lg: 60 };
  const spinnerSize = sizeMap[size];

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        style={{
          width: spinnerSize,
          height: spinnerSize,
          border: '3px solid #e5e7eb',
          borderTopColor: '#059669',
          borderRadius: '50%'
        }}
      />
    </div>
  );
}

// Empty State - Beautiful and inviting
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px',
        textAlign: 'center'
      }}
    >
      {Icon && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)'
          }}
        >
          <Icon style={{ width: '36px', height: '36px', color: '#059669' }} />
        </motion.div>
      )}
      <h3 style={{
        fontSize: '20px',
        fontWeight: '600',
        color: '#111827',
        margin: '0 0 8px 0',
        letterSpacing: '-0.01em'
      }}>
        {title}
      </h3>
      {description && (
        <p style={{
          fontSize: '15px',
          color: '#6b7280',
          maxWidth: '400px',
          margin: '0 0 24px 0',
          lineHeight: '1.6'
        }}>
          {description}
        </p>
      )}
      {action}
    </motion.div>
  );
}

// Data Table - Premium design with hover effects
export function DataTable({ columns, data, onRowClick, loading, emptyState }) {
  if (loading) {
    return <LoadingSpinner />;
  }

  if (!data || data.length === 0) {
    return emptyState || <EmptyState title="No data" description="No records found" />;
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
        <thead>
          <tr style={{ backgroundColor: '#f9fafb' }}>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  padding: '16px 24px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid #e5e7eb'
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <motion.tr
              key={row.id || idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              onClick={() => onRowClick?.(row)}
              style={{
                cursor: onRowClick ? 'pointer' : 'default',
                backgroundColor: 'white',
                transition: 'all 0.2s'
              }}
              whileHover={onRowClick ? {
                backgroundColor: '#f9fafb',
                scale: 1.002,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
              } : {}}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  style={{
                    padding: '20px 24px',
                    fontSize: '14px',
                    color: '#111827',
                    borderBottom: '1px solid #f3f4f6'
                  }}
                >
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Pagination - Clean and functional
export function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = [];
  const maxVisible = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
  
  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  const buttonStyle = {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '500',
    border: '1px solid #e5e7eb',
    backgroundColor: 'white',
    color: '#374151',
    cursor: 'pointer',
    transition: 'all 0.2s'
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '20px 32px',
      backgroundColor: 'white',
      borderTop: '1px solid #f3f4f6'
    }}>
      <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
        Page <span style={{ fontWeight: '600', color: '#111827' }}>{currentPage}</span> of{' '}
        <span style={{ fontWeight: '600', color: '#111827' }}>{totalPages}</span>
      </p>
      <div style={{ display: 'flex', gap: '8px' }}>
        <motion.button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            ...buttonStyle,
            borderRadius: '8px 0 0 8px',
            opacity: currentPage === 1 ? 0.5 : 1
          }}
          whileHover={{ backgroundColor: '#f9fafb' }}
          whileTap={{ scale: 0.98 }}
        >
          Previous
        </motion.button>
        {pages.map((page) => (
          <motion.button
            key={page}
            onClick={() => onPageChange(page)}
            style={{
              ...buttonStyle,
              backgroundColor: page === currentPage ? '#059669' : 'white',
              color: page === currentPage ? 'white' : '#374151',
              borderColor: page === currentPage ? '#059669' : '#e5e7eb'
            }}
            whileHover={{ backgroundColor: page === currentPage ? '#047857' : '#f9fafb' }}
            whileTap={{ scale: 0.95 }}
          >
            {page}
          </motion.button>
        ))}
        <motion.button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            ...buttonStyle,
            borderRadius: '0 8px 8px 0',
            opacity: currentPage === totalPages ? 0.5 : 1
          }}
          whileHover={{ backgroundColor: '#f9fafb' }}
          whileTap={{ scale: 0.98 }}
        >
          Next
        </motion.button>
      </div>
    </div>
  );
}

// Status Badge - Beautiful color-coded badges
export function StatusBadge({ status }) {
  const variants = {
    active: { bg: '#dbeafe', color: '#1e40af', label: 'Active' },
    negotiation: { bg: '#fef3c7', color: '#92400e', label: 'Negotiation' },
    approved: { bg: '#e9d5ff', color: '#6b21a8', label: 'Approved' },
    executed: { bg: '#d1fae5', color: '#065f46', label: 'Executed' },
    pending_payment: { bg: '#fed7aa', color: '#9a3412', label: 'Pending Payment' },
    completed: { bg: '#e5e7eb', color: '#374151', label: 'Completed' },
    cancelled: { bg: '#fee2e2', color: '#991b1b', label: 'Cancelled' },
    pass: { bg: '#d1fae5', color: '#065f46', label: 'Pass' },
    warning: { bg: '#fef3c7', color: '#92400e', label: 'Warning' },
    fail: { bg: '#fee2e2', color: '#991b1b', label: 'Fail' },
    pending: { bg: '#e5e7eb', color: '#374151', label: 'Pending' },
    todo: { bg: '#e5e7eb', color: '#374151', label: 'To Do' },
    in_progress: { bg: '#dbeafe', color: '#1e40af', label: 'In Progress' },
    blocked: { bg: '#fee2e2', color: '#991b1b', label: 'Blocked' },
    done: { bg: '#d1fae5', color: '#065f46', label: 'Done' }
  };

  const variant = variants[status] || variants.pending;

  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        backgroundColor: variant.bg,
        color: variant.color,
        letterSpacing: '0.01em'
      }}
    >
      {variant.label}
    </motion.span>
  );
}

// Stat Card - Premium animated card
export function StatCard({ label, value, change, trend, icon: Icon, loading }) {
  if (loading) {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #f3f4f6',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}>
        <LoadingSpinner size="sm" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0, 0, 0, 0.08)' }}
      transition={{ duration: 0.2 }}
      style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #f3f4f6',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        cursor: 'default'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <p style={{
            fontSize: '13px',
            fontWeight: '500',
            color: '#6b7280',
            margin: '0 0 12px 0',
            letterSpacing: '0.02em',
            textTransform: 'uppercase'
          }}>
            {label}
          </p>
          <p style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#111827',
            margin: '0 0 8px 0',
            letterSpacing: '-0.02em'
          }}>
            {value}
          </p>
          {change !== undefined && (
            <p style={{
              fontSize: '14px',
              fontWeight: '600',
              color: trend === 'up' ? '#059669' : trend === 'down' ? '#dc2626' : '#6b7280',
              margin: 0
            }}>
              {change > 0 ? '+' : ''}{change}%
            </p>
          )}
        </div>
        {Icon && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Icon style={{ width: '28px', height: '28px', color: '#059669' }} />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// Drawer Container - Smooth slide-in animation
export function DrawerContainer({ isOpen, onClose, title, children, size = 'md' }) {
  const sizeClasses = {
    sm: '400px',
    md: '600px',
    lg: '800px',
    xl: '1000px'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(4px)',
              zIndex: 40
            }}
            onClick={onClose}
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              maxWidth: sizeClasses[size],
              backgroundColor: 'white',
              boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.12)',
              zIndex: 50,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Header */}
            <div style={{
              padding: '24px 32px',
              borderBottom: '1px solid #f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
                margin: 0,
                letterSpacing: '-0.01em'
              }}>
                {title}
              </h2>
              <motion.button
                onClick={onClose}
                whileHover={{ backgroundColor: '#f3f4f6', rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  color: '#6b7280',
                  transition: 'all 0.2s'
                }}
              >
                ✕
              </motion.button>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Tabs - Clean and animated
export function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: 'white' }}>
      <nav style={{ display: 'flex', gap: '32px', padding: '0 32px' }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <motion.button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              style={{
                padding: '16px 0',
                fontSize: '14px',
                fontWeight: '600',
                color: isActive ? '#059669' : '#6b7280',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                position: 'relative',
                transition: 'color 0.2s'
              }}
              whileHover={{ color: '#059669' }}
            >
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  style={{
                    position: 'absolute',
                    bottom: -1,
                    left: 0,
                    right: 0,
                    height: '2px',
                    backgroundColor: '#059669'
                  }}
                />
              )}
            </motion.button>
          );
        })}
      </nav>
    </div>
  );
}

// Filter Bar - Clean layout
export function FilterBar({ children }) {
  return (
    <div style={{
      backgroundColor: '#f9fafb',
      borderBottom: '1px solid #e5e7eb',
      padding: '16px 32px'
    }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
        {children}
      </div>
    </div>
  );
}

// Select Input - Premium styling
export function Select({ label, value, onChange, options, placeholder }) {
  return (
    <div>
      {label && (
        <label style={{
          display: 'block',
          fontSize: '13px',
          fontWeight: '500',
          color: '#374151',
          marginBottom: '6px'
        }}>
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '10px 14px',
          fontSize: '14px',
          color: '#111827',
          backgroundColor: 'white',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// Text Input - Premium styling
export function TextInput({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      {label && (
        <label style={{
          display: 'block',
          fontSize: '13px',
          fontWeight: '500',
          color: '#374151',
          marginBottom: '6px'
        }}>
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '10px 14px',
          fontSize: '14px',
          color: '#111827',
          backgroundColor: 'white',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          transition: 'all 0.2s'
        }}
      />
    </div>
  );
}

// Button - Premium with animations
export function Button({ children, onClick, variant = 'primary', size = 'md', disabled, icon: Icon }) {
  const variants = {
    primary: {
      backgroundColor: '#059669',
      color: 'white',
      border: 'none',
      hoverBg: '#047857'
    },
    secondary: {
      backgroundColor: 'white',
      color: '#374151',
      border: '1px solid #d1d5db',
      hoverBg: '#f9fafb'
    },
    danger: {
      backgroundColor: '#dc2626',
      color: 'white',
      border: 'none',
      hoverBg: '#b91c1c'
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '#374151',
      border: 'none',
      hoverBg: '#f3f4f6'
    }
  };

  const sizes = {
    sm: { padding: '6px 12px', fontSize: '13px' },
    md: { padding: '10px 16px', fontSize: '14px' },
    lg: { padding: '12px 24px', fontSize: '16px' }
  };

  const style = variants[variant];
  const sizeStyle = sizes[size];

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02, backgroundColor: disabled ? style.backgroundColor : style.hoverBg }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        ...sizeStyle,
        fontWeight: '600',
        borderRadius: '8px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.2s',
        ...style
      }}
    >
      {Icon && <Icon style={{ width: '16px', height: '16px' }} />}
      {children}
    </motion.button>
  );
}
