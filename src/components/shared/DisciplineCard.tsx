import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../app/providers/I18nProvider';
import { getCoursesByDiscipline, type Discipline } from '../../data/mock';
import { Badge, Card } from '../ui';
import { DisciplineIcon } from './DisciplineIcon';

export function DisciplineCard({ discipline }: { discipline: Discipline }) {
  const { locale, dir, t } = useI18n();
  const count = getCoursesByDiscipline(discipline.slug).length;
  const countLabel =
    count === 1
      ? t('common.sampleCourseSingular')
      : t('common.sampleCoursesCount', { count });

  return (
    <Card interactive className="discipline-card">
      <div className={`discipline-card__banner accent-surface--${discipline.accent}`}>
        <div className={`discipline-card__icon accent-badge--${discipline.accent}`}>
          <DisciplineIcon name={discipline.iconName} size={24} />
        </div>
        <Badge variant="neutral">{countLabel}</Badge>
      </div>

      <div className="discipline-card__body">
        <h3 className="text-h3">{discipline.name[locale]}</h3>
        <p className="text-small">{discipline.shortDescription[locale]}</p>
      </div>

      <div className="discipline-card__footer">
        <Link to={`/disciplines/${discipline.slug}`} className="card-inline-link">
          <span>{t('common.viewDiscipline')}</span>
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
