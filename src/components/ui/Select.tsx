import { useId, type SelectHTMLAttributes } from 'react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export function Select({ label, id, className = '', children, ...rest }: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <div className="ui-field">
      {label ? (
        <label htmlFor={selectId} className="ui-field__label">
          {label}
        </label>
      ) : null}
      <select id={selectId} className={`ui-field__control ${className}`.trim()} {...rest}>
        {children}
      </select>
    </div>
  );
}
