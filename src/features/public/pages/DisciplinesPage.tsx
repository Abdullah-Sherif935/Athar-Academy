import { FolderSearch } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';
import { DisciplineCard, SearchBar } from '../../../components/shared';
import { Badge, Button, EmptyState } from '../../../components/ui';
import { MOCK_DISCIPLINES } from '../../../data/mock';

export function DisciplinesPage() {
  const { t, locale } = useI18n();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MOCK_DISCIPLINES;
    return MOCK_DISCIPLINES.filter(
      (d) =>
        d.name[locale].toLowerCase().includes(q) ||
        d.shortDescription[locale].toLowerCase().includes(q) ||
        d.name.en.toLowerCase().includes(q) ||
        d.name.ar.toLowerCase().includes(q),
    );
  }, [query, locale]);

  return (
    <>
      <section className="page-banner">
        <div className="container">
          <div className="page-banner__inner">
            <nav className="breadcrumb" aria-label={t('a11y.breadcrumb')}>
              <Link to="/">{t('nav.home')}</Link>
              <span aria-hidden="true">/</span>
              <span>{t('nav.disciplines')}</span>
            </nav>
            <div className="section-header__meta">
              <Badge variant="brand">{t('disciplinesPage.eyebrow')}</Badge>
              <Badge variant="orange">{t('common.demoBadge')}</Badge>
            </div>
            <h1 className="text-display">{t('disciplinesPage.title')}</h1>
            <p className="hero__subtitle">{t('disciplinesPage.description')}</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="filter-toolbar">
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder={t('disciplinesPage.searchPlaceholder')}
            />
          </div>

          {filtered.length > 0 ? (
            <div className="grid-4">
              {filtered.map((discipline) => (
                <DisciplineCard key={discipline.slug} discipline={discipline} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<FolderSearch size={24} />}
              title={t('disciplinesPage.emptyTitle')}
              description={t('disciplinesPage.emptyDescription')}
              action={
                <Button variant="secondary" onClick={() => setQuery('')}>
                  {t('common.resetFilters')}
                </Button>
              }
            />
          )}
        </div>
      </section>
    </>
  );
}
