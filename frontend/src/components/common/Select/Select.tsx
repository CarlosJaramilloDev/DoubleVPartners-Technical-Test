import { forwardRef } from 'react';
import type { SelectHTMLAttributes } from 'react';
import './Select.css';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => {
    return (
      <div className="select-wrapper">
        {label && <label className="select-label">{label}</label>}
        <select
          ref={ref}
          className={`select ${error ? 'select--error' : ''} ${className}`}
          {...props}
        >
          <option value="">Selecciona una opción</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <span className="select-error">{error}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';

