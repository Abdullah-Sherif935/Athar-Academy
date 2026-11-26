import type { ReactNode } from 'react';
import { Badge, type BadgeProps } from '../ui';

export interface SectionHeadingProps {
  eyebrow?: string;
  eyebrowVariant?: BadgeProps['variant'];
  demoBadge?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function SectionHeading({
  eyebrow,
  eyebrowVariant = 'brand',
  demoBadge,
  title,
  description,
  action,
}: SectionHeadingProps) {
  return (
    <div className="section-heading-row">
      <div className="section-header" style={{ marginBlockEnd: 0 }}>
        {(eyebrow || demoBadge) && (
          <div className="section-header__meta">
            {eyebrow ? <Badge variant={eyebrowVariant}>{eyebrow}</Badge> : null}
            {demoBadge ? <Badge variant="orange">{demoBadge}</Badge> : null}
          </div>
        )}
        <h2 className="text-h1">{title}</h2>
        {description ? <p className="text-body">{description}</p> : null}
      </div>
      {action ? <div className="section-heading-row__action">{action}</div> : null}
    </div>
  );
}
