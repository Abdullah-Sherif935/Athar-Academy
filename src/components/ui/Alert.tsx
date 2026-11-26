import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import type { ReactNode } from 'react';

export interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title: string;
  children?: ReactNode;
}

const ICONS = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
};

export function Alert({ variant = 'info', title, children }: AlertProps) {
  const Icon = ICONS[variant];

  return (
    <div className={`ui-alert ui-alert--${variant}`} role={variant === 'error' ? 'alert' : 'status'}>
      <Icon size={18} className="ui-alert__icon" aria-hidden="true" />
      <div>
        <div className="ui-alert__title">{title}</div>
        {children && <div className="ui-alert__body">{children}</div>}
      </div>
    </div>
  );
}
