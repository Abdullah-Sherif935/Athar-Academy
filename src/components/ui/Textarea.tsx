import { AlertCircle } from 'lucide-react';
import { useId, type TextareaHTMLAttributes } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  helperText?: string;
  error?: string;
}

export function Textarea({
  label,
  helperText,
  error,
  id,
  className = '',
  ...rest
}: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const errorId = `${textareaId}-error`;
  const helperId = `${textareaId}-helper`;

  return (
    <div className="ui-field">
      <label htmlFor={textareaId} className="ui-field__label">
        {label}
      </label>
      <textarea
        id={textareaId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        className={`ui-field__control ui-field__textarea ${
          error ? 'ui-field__control--error' : ''
        } ${className}`.trim()}
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
