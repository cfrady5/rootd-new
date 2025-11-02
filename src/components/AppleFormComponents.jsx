// Enhanced Apple-style Form Components
import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff, Check, X, AlertCircle } from 'lucide-react';

// Apple-style Input Field
export const AppleInput = forwardRef(({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  helperText,
  required,
  disabled,
  autoComplete,
  icon: Icon,
  className = '',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const inputType = type === 'password' && showPassword ? 'text' : type;
  
  return (
    <div className={`apple-input-group ${className}`} style={{ marginBottom: 'var(--apple-space-4)' }}>
      {label && (
        <label 
          className="apple-input-label apple-body-small"
          style={{
            display: 'block',
            marginBottom: 'var(--apple-space-2)',
            color: error ? 'var(--apple-red)' : 'var(--apple-text-primary)',
            fontWeight: 'var(--apple-font-semibold)'
          }}
        >
          {label}
          {required && <span style={{ color: 'var(--apple-red)', marginLeft: '2px' }}>*</span>}
        </label>
      )}
      
      <div 
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {Icon && (
          <Icon 
            size={20} 
            style={{
              position: 'absolute',
              left: 'var(--apple-space-4)',
              color: error ? 'var(--apple-red)' : 'var(--apple-text-tertiary)',
              zIndex: 1
            }}
          />
        )}
        
        <input
          ref={ref}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="apple-input"
          style={{
            width: '100%',
            padding: `var(--apple-space-4) ${type === 'password' ? '48px' : Icon ? '48px' : 'var(--apple-space-4)'} var(--apple-space-4) ${Icon ? '48px' : 'var(--apple-space-4)'}`,
            fontSize: 'var(--apple-text-base)',
            color: disabled ? 'var(--apple-text-tertiary)' : 'var(--apple-text-primary)',
            background: disabled ? 'var(--apple-gray-100)' : 'var(--apple-bg-secondary)',
            border: `2px solid ${error ? 'var(--apple-red)' : isFocused ? 'var(--apple-blue)' : 'var(--apple-border-light)'}`,
            borderRadius: 'var(--apple-radius-lg)',
            transition: 'all var(--apple-transition-base) var(--apple-ease-out)',
            outline: 'none',
            minHeight: '48px' // Better touch target
          }}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
          {...props}
        />
        
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: 'var(--apple-space-3)',
              background: 'transparent',
              border: 'none',
              padding: 'var(--apple-space-2)',
              cursor: 'pointer',
              color: 'var(--apple-text-tertiary)',
              borderRadius: 'var(--apple-radius-base)',
              transition: 'color var(--apple-transition-base)'
            }}
            onMouseEnter={(e) => e.target.style.color = 'var(--apple-text-primary)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--apple-text-tertiary)'}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      
      {error && (
        <div
          className="apple-flex apple-items-center apple-gap-2"
          style={{
            marginTop: 'var(--apple-space-2)',
            color: 'var(--apple-red)'
          }}
          id={`${props.id}-error`}
          role="alert"
        >
          <AlertCircle size={14} />
          <span className="apple-body-small">{error}</span>
        </div>
      )}
      
      {helperText && !error && (
        <p 
          className="apple-body-small"
          style={{
            marginTop: 'var(--apple-space-2)',
            color: 'var(--apple-text-secondary)',
            margin: 'var(--apple-space-2) 0 0 0'
          }}
          id={`${props.id}-helper`}
        >
          {helperText}
        </p>
      )}
    </div>
  );
});

AppleInput.displayName = 'AppleInput';

// Apple-style Textarea
export const AppleTextarea = forwardRef(({
  label,
  placeholder,
  value,
  onChange,
  error,
  helperText,
  required,
  disabled,
  rows = 4,
  className = '',
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div className={`apple-input-group ${className}`} style={{ marginBottom: 'var(--apple-space-4)' }}>
      {label && (
        <label 
          className="apple-input-label apple-body-small"
          style={{
            display: 'block',
            marginBottom: 'var(--apple-space-2)',
            color: error ? 'var(--apple-red)' : 'var(--apple-text-primary)',
            fontWeight: 'var(--apple-font-semibold)'
          }}
        >
          {label}
          {required && <span style={{ color: 'var(--apple-red)', marginLeft: '2px' }}>*</span>}
        </label>
      )}
      
      <textarea
        ref={ref}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{
          width: '100%',
          padding: 'var(--apple-space-4)',
          fontSize: 'var(--apple-text-base)',
          color: disabled ? 'var(--apple-text-tertiary)' : 'var(--apple-text-primary)',
          background: disabled ? 'var(--apple-gray-100)' : 'var(--apple-bg-secondary)',
          border: `2px solid ${error ? 'var(--apple-red)' : isFocused ? 'var(--apple-blue)' : 'var(--apple-border-light)'}`,
          borderRadius: 'var(--apple-radius-lg)',
          transition: 'all var(--apple-transition-base) var(--apple-ease-out)',
          outline: 'none',
          resize: 'vertical',
          fontFamily: 'var(--apple-font-family)',
          lineHeight: 'var(--apple-leading-normal)'
        }}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
        {...props}
      />
      
      {error && (
        <div
          className="apple-flex apple-items-center apple-gap-2"
          style={{
            marginTop: 'var(--apple-space-2)',
            color: 'var(--apple-red)'
          }}
          id={`${props.id}-error`}
          role="alert"
        >
          <AlertCircle size={14} />
          <span className="apple-body-small">{error}</span>
        </div>
      )}
      
      {helperText && !error && (
        <p 
          className="apple-body-small"
          style={{
            marginTop: 'var(--apple-space-2)',
            color: 'var(--apple-text-secondary)',
            margin: 'var(--apple-space-2) 0 0 0'
          }}
          id={`${props.id}-helper`}
        >
          {helperText}
        </p>
      )}
    </div>
  );
});

AppleTextarea.displayName = 'AppleTextarea';

// Apple-style Select
export const AppleSelect = forwardRef(({
  label,
  options = [],
  value,
  onChange,
  error,
  helperText,
  required,
  disabled,
  placeholder = 'Select an option',
  className = '',
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div className={`apple-input-group ${className}`} style={{ marginBottom: 'var(--apple-space-4)' }}>
      {label && (
        <label 
          className="apple-input-label apple-body-small"
          style={{
            display: 'block',
            marginBottom: 'var(--apple-space-2)',
            color: error ? 'var(--apple-red)' : 'var(--apple-text-primary)',
            fontWeight: 'var(--apple-font-semibold)'
          }}
        >
          {label}
          {required && <span style={{ color: 'var(--apple-red)', marginLeft: '2px' }}>*</span>}
        </label>
      )}
      
      <select
        ref={ref}
        value={value}
        onChange={onChange}
        disabled={disabled}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{
          width: '100%',
          padding: 'var(--apple-space-4)',
          fontSize: 'var(--apple-text-base)',
          color: disabled ? 'var(--apple-text-tertiary)' : value ? 'var(--apple-text-primary)' : 'var(--apple-text-secondary)',
          background: disabled ? 'var(--apple-gray-100)' : 'var(--apple-bg-secondary)',
          border: `2px solid ${error ? 'var(--apple-red)' : isFocused ? 'var(--apple-blue)' : 'var(--apple-border-light)'}`,
          borderRadius: 'var(--apple-radius-lg)',
          transition: 'all var(--apple-transition-base) var(--apple-ease-out)',
          outline: 'none',
          minHeight: '48px',
          cursor: disabled ? 'not-allowed' : 'pointer'
        }}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="apple-flex apple-items-center apple-gap-2"
          style={{
            marginTop: 'var(--apple-space-2)',
            color: 'var(--apple-red)'
          }}
          id={`${props.id}-error`}
          role="alert"
        >
          <AlertCircle size={14} />
          <span className="apple-body-small">{error}</span>
        </motion.div>
      )}
      
      {helperText && !error && (
        <p 
          className="apple-body-small"
          style={{
            marginTop: 'var(--apple-space-2)',
            color: 'var(--apple-text-secondary)',
            margin: 'var(--apple-space-2) 0 0 0'
          }}
          id={`${props.id}-helper`}
        >
          {helperText}
        </p>
      )}
    </div>
  );
});

AppleSelect.displayName = 'AppleSelect';

// Apple-style Checkbox
export const AppleCheckbox = ({
  label,
  checked,
  onChange,
  disabled,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className={`apple-checkbox-group ${className}`} style={{ marginBottom: 'var(--apple-space-3)' }}>
      <label 
        className="apple-flex apple-items-center apple-gap-3"
        style={{
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1
        }}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          style={{
            width: '20px',
            height: '20px',
            accentColor: 'var(--apple-blue)',
            cursor: disabled ? 'not-allowed' : 'pointer'
          }}
          aria-invalid={error ? 'true' : 'false'}
          {...props}
        />
        <span 
          className="apple-body"
          style={{
            color: error ? 'var(--apple-red)' : 'var(--apple-text-primary)'
          }}
        >
          {label}
        </span>
      </label>
      
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="apple-flex apple-items-center apple-gap-2"
          style={{
            marginTop: 'var(--apple-space-2)',
            marginLeft: '32px', // Align with checkbox
            color: 'var(--apple-red)'
          }}
          role="alert"
        >
          <AlertCircle size={14} />
          <span className="apple-body-small">{error}</span>
        </motion.div>
      )}
    </div>
  );
};

// Apple-style Form Group
export const AppleFormGroup = ({ 
  title, 
  description, 
  children, 
  className = '' 
}) => {
  return (
    <fieldset 
      className={`apple-form-group ${className}`}
      style={{
        border: 'none',
        padding: 0,
        margin: '0 0 var(--apple-space-8) 0'
      }}
    >
      {title && (
        <legend 
          className="apple-heading-4"
          style={{
            padding: 0,
            marginBottom: 'var(--apple-space-2)',
            color: 'var(--apple-text-primary)'
          }}
        >
          {title}
        </legend>
      )}
      
      {description && (
        <p 
          className="apple-body"
          style={{
            color: 'var(--apple-text-secondary)',
            margin: '0 0 var(--apple-space-6) 0'
          }}
        >
          {description}
        </p>
      )}
      
      {children}
    </fieldset>
  );
};

// Apple-style Form Actions
export const AppleFormActions = ({ 
  children, 
  align = 'right',
  className = '' 
}) => {
  const alignmentStyles = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
    stretch: 'stretch'
  };
  
  return (
    <div 
      className={`apple-form-actions apple-flex apple-gap-3 ${className}`}
      style={{
        justifyContent: alignmentStyles[align],
        paddingTop: 'var(--apple-space-6)',
        borderTop: '1px solid var(--apple-border-light)',
        marginTop: 'var(--apple-space-8)'
      }}
    >
      {children}
    </div>
  );
};