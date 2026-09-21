import React from 'react';

const Select = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
  required = false,
  className = '',
  ...props
}) => {
  return (
    <div className="form-group">
      {label && (
        <label className="form-label">
          {label} {required && <span style={{ color: '#f44336' }}>*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        className={`form-control ${error ? 'error' : ''} ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <div className="form-error">{error}</div>}
    </div>
  );
};

export default Select;