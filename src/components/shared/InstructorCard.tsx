import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../app/providers/I18nProvider';
import type { Instructor } from '../../data/mock';
import { Badge, Card } from '../ui';

export function InstructorCard({ instructor }: { instructor: Instructor }) {
  const { locale, dir, t } = useI18n();

  return (
    <Card interactive className="instructor-card">
      <div className="instructor-card__header">
        <div className={`instructor-avatar accent-badge--${instructor.accent}`} aria-hidden="true">
          {instructor.initials}
        </div>
        <div>
          <h3 className="text-h3">
            <Link to={`/instructors/${instructor.slug}`} className="card-title-link">
              {instructor.name[locale]}
            </Link>
          </h3>
          <p className="text-caption">{instructor.title[locale]}</p>
        </div>
      </div>

      <p className="text-small">{instructor.shortBio[locale]}</p>

      <div className="instructor-card__tags">
        {instructor.expertise.slice(0, 2).map((item, idx) => (
          <Badge key={idx} variant="neutral">
            {item[locale]}
          </Badge>
        ))}
      </div>

      <div className="instructor-card__footer">
        <Link to={`/instructors/${instructor.slug}`} className="card-inline-link">
          <span>{t('common.viewProfile')}</span>
          {dir === 'rtl' ? (
            <ArrowLeft size={16} aria-hidden="true" />
          ) : (
            <ArrowRight size={16} aria-hidden="true" />
          )}
        </Link>
      </div>
    </Card>
  );
}
