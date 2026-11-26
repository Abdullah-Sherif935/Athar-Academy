import { AlertCircle } from 'lucide-react';
import { useId, type InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export function Input({
  label,
  helperText,
  error,
  id,
  className = '',
  ...rest
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  return (
    <div className="ui-field">
      {label ? (
        <label htmlFor={inputId} className="ui-field__label">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        className={`ui-field__control ${error ? 'ui-field__control--error' : ''} ${className}`.trim()}
        {...rest}
      />
      {error ? (
        <span id={errorId} role="alert" className="ui-field__error">
          <AlertCircle size={14} aria-hidden="true" />
          <span>{error}</span>
        </span>
      ) : helperText ? (
        <span id={helperId} className="ui-field__helper">
          {helperText}
        </span>
      ) : null}
    </div>
  );
}
