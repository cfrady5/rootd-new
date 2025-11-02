// Enhanced Apple-style Dashboard Components
import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Users,
  Target,
  Award,
  Star,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';

// Apple-style Metric Card
export function AppleMetricCard({ 
  title, 
  value, 
  change, 
  trend, 
  icon: Icon, 
  loading = false,
  color = "success"
}) {
  const colorMap = {
    success: "var(--apple-green-primary)",
    warning: "var(--apple-orange)",
    danger: "var(--apple-red)",
    info: "var(--apple-blue)"
  };

  const bgColorMap = {
    success: "rgba(48, 209, 88, 0.1)",
    warning: "rgba(255, 149, 0, 0.1)",
    danger: "rgba(255, 59, 48, 0.1)",
    info: "rgba(0, 122, 255, 0.1)"
  };

  if (loading) {
    return (
      <div className="apple-card" style={{ minHeight: "120px" }}>
        <div className="apple-flex apple-items-center apple-justify-center" style={{ height: "100%" }}>
          <div className="apple-spinner" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="apple-card"
      style={{
        padding: "var(--apple-space-6)",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden"
      }}
      whileHover={{ 
        y: -2,
        boxShadow: "var(--apple-shadow-lg)"
      }}
    >
      {/* Background Decoration */}
      <div 
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "60px",
          height: "60px",
          background: bgColorMap[color],
          borderRadius: "50%",
          transform: "translate(20px, -20px)",
          opacity: 0.5
        }}
      />
      
      {/* Header */}
      <div className="apple-flex apple-items-center apple-justify-between" style={{ marginBottom: "var(--apple-space-4)" }}>
        <div 
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "var(--apple-radius-md)",
            background: bgColorMap[color],
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Icon size={20} color={colorMap[color]} />
        </div>
        <MoreHorizontal size={16} color="var(--apple-text-tertiary)" />
      </div>

      {/* Content */}
      <div>
        <h3 className="apple-body-small" style={{ 
          color: "var(--apple-text-secondary)",
          margin: "0 0 var(--apple-space-2) 0",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          fontWeight: "var(--apple-font-semibold)"
        }}>
          {title}
        </h3>
        
        <div className="apple-flex apple-items-end apple-gap-2" style={{ marginBottom: "var(--apple-space-2)" }}>
          <span className="apple-heading-2" style={{ 
            color: "var(--apple-text-primary)",
            margin: 0,
            lineHeight: 1
          }}>
            {value}
          </span>
        </div>

        {change && (
          <div className="apple-flex apple-items-center apple-gap-1">
            {trend === "up" ? (
              <TrendingUp size={14} color={colorMap.success} />
            ) : (
              <TrendingDown size={14} color={colorMap.danger} />
            )}
            <span 
              className="apple-body-small"
              style={{ 
                color: trend === "up" ? colorMap.success : colorMap.danger,
                fontWeight: "var(--apple-font-medium)"
              }}
            >
              {change}
            </span>
            <span className="apple-body-small" style={{ color: "var(--apple-text-tertiary)" }}>
              from last month
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Apple-style Dashboard Section
export function AppleDashboardSection({ 
  title, 
  description, 
  action,
  children,
  className = ""
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className={className}
      style={{ marginBottom: "var(--apple-space-8)" }}
    >
      {/* Section Header */}
      <div className="apple-flex apple-items-center apple-justify-between" style={{ 
        marginBottom: "var(--apple-space-6)"
      }}>
        <div>
          <h2 className="apple-heading-3" style={{ 
            margin: "0 0 var(--apple-space-1) 0"
          }}>
            {title}
          </h2>
          {description && (
            <p className="apple-body" style={{ 
              color: "var(--apple-text-secondary)",
              margin: 0
            }}>
              {description}
            </p>
          )}
        </div>
        {action && (
          <button className="apple-btn apple-btn-ghost apple-flex apple-items-center apple-gap-2">
            {action.label}
            <ChevronRight size={16} />
          </button>
        )}
      </div>
      
      {/* Section Content */}
      {children}
    </motion.section>
  );
}

// Apple-style List Item
export function AppleListItem({ 
  icon: Icon,
  title,
  subtitle,
  value,
  badge,
  onClick,
  href
}) {
  const Component = href ? 'a' : 'button';
  const props = href ? { href } : { onClick };
  
  return (
    <motion.div
      whileHover={{ x: 4 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
    >
      <Component
        {...props}
        className="apple-flex apple-items-center apple-gap-4"
        style={{
          width: "100%",
          padding: "var(--apple-space-4)",
          background: "transparent",
          border: "1px solid var(--apple-border-light)",
          borderRadius: "var(--apple-radius-lg)",
          textDecoration: "none",
          cursor: "pointer",
          transition: "all var(--apple-transition-base) var(--apple-ease-out)",
          marginBottom: "var(--apple-space-2)"
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = "var(--apple-gray-50)";
          e.target.style.borderColor = "var(--apple-border-medium)";
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = "transparent";
          e.target.style.borderColor = "var(--apple-border-light)";
        }}
      >
        {Icon && (
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "var(--apple-radius-md)",
            background: "var(--apple-gray-100)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Icon size={20} color="var(--apple-text-secondary)" />
          </div>
        )}
        
        <div style={{ flex: 1, textAlign: "left" }}>
          <div className="apple-body" style={{ 
            margin: "0 0 var(--apple-space-1) 0",
            fontWeight: "var(--apple-font-medium)",
            color: "var(--apple-text-primary)"
          }}>
            {title}
          </div>
          {subtitle && (
            <div className="apple-body-small" style={{ 
              color: "var(--apple-text-secondary)",
              margin: 0
            }}>
              {subtitle}
            </div>
          )}
        </div>
        
        <div className="apple-flex apple-items-center apple-gap-2">
          {badge && (
            <div className={`apple-badge apple-badge-${badge.type || 'neutral'}`}>
              {badge.value}
            </div>
          )}
          {value && (
            <span className="apple-body" style={{ 
              color: "var(--apple-text-secondary)",
              fontWeight: "var(--apple-font-medium)"
            }}>
              {value}
            </span>
          )}
          <ChevronRight size={16} color="var(--apple-text-tertiary)" />
        </div>
      </Component>
    </motion.div>
  );
}

// Apple-style Progress Bar
export function AppleProgressBar({ 
  value = 0, 
  max = 100, 
  color = "success",
  size = "md",
  showValue = true,
  label
}) {
  const percentage = Math.min((value / max) * 100, 100);
  
  const heightMap = {
    sm: "4px",
    md: "8px",
    lg: "12px"
  };
  
  const colorMap = {
    success: "var(--apple-green-primary)",
    warning: "var(--apple-orange)",
    danger: "var(--apple-red)",
    info: "var(--apple-blue)"
  };

  return (
    <div>
      {(label || showValue) && (
        <div className="apple-flex apple-justify-between apple-items-center" style={{ 
          marginBottom: "var(--apple-space-2)"
        }}>
          {label && (
            <span className="apple-body-small" style={{ 
              color: "var(--apple-text-secondary)",
              fontWeight: "var(--apple-font-medium)"
            }}>
              {label}
            </span>
          )}
          {showValue && (
            <span className="apple-body-small" style={{ 
              color: "var(--apple-text-primary)",
              fontWeight: "var(--apple-font-semibold)"
            }}>
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      
      <div 
        style={{
          width: "100%",
          height: heightMap[size],
          backgroundColor: "var(--apple-gray-200)",
          borderRadius: "var(--apple-radius-full)",
          overflow: "hidden"
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          style={{
            height: "100%",
            backgroundColor: colorMap[color],
            borderRadius: "var(--apple-radius-full)"
          }}
        />
      </div>
    </div>
  );
}

// Apple-style Empty State
export function AppleEmptyState({ 
  icon: Icon,
  title,
  description,
  action
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="apple-flex apple-flex-col apple-items-center"
      style={{ 
        padding: "var(--apple-space-12) var(--apple-space-6)",
        textAlign: "center"
      }}
    >
      {Icon && (
        <div 
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "var(--apple-gray-100)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "var(--apple-space-6)"
          }}
        >
          <Icon size={32} color="var(--apple-text-tertiary)" />
        </div>
      )}
      
      <h3 className="apple-heading-4" style={{ 
        margin: "0 0 var(--apple-space-2) 0",
        color: "var(--apple-text-primary)"
      }}>
        {title}
      </h3>
      
      {description && (
        <p className="apple-body" style={{ 
          color: "var(--apple-text-secondary)",
          margin: "0 0 var(--apple-space-6) 0",
          maxWidth: "400px"
        }}>
          {description}
        </p>
      )}
      
      {action && (
        <button 
          className="apple-btn apple-btn-primary"
          onClick={action.onClick}
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}