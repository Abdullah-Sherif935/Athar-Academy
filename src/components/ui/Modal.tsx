import { X } from 'lucide-react';
import { useEffect, useId, type ReactNode } from 'react';
import { useI18n } from '../../app/providers/I18nProvider';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
}: ModalProps) {
  const { t } = useI18n();
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="ui-modal-backdrop"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="ui-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
      >
        <div className="ui-modal__header">
          <div>
            <h2 id={titleId} className="text-h3">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="text-small" style={{ marginBlockStart: '6px' }}>
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            className="ui-modal__close"
            onClick={onClose}
            aria-label={t('a11y.closeModal')}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <div>{children}</div>
        {footer ? <div className="ui-modal__footer">{footer}</div> : null}
      </div>
    </div>
  );
}
