import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useI18n } from '../../../app/providers/I18nProvider';
import { usePlatformDemo } from '../../../app/providers/PlatformDemoContext';
import { DisciplineIcon } from '../../../components/shared';
import { Alert, Badge, Button, Card, Input, Modal, Textarea } from '../../../components/ui';
import type { PlatformDiscipline } from '../../../data/mock/admin';
import { StudentPageHeader } from '../../student/components/StudentPageHeader';
import { AdminStatusBadge } from '../components/AdminStatusBadge';

export function AdminDisciplinesPage() {
  const { t, locale } = useI18n();
  const { disciplines, courses, createDiscipline, updateDiscipline, deleteDiscipline } =
    usePlatformDemo();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PlatformDiscipline | null>(null);
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [descAr, setDescAr] = useState('');
  const [descEn, setDescEn] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setNameAr('');
    setNameEn('');
    setDescAr('');
    setDescEn('');
    setModalOpen(true);
  };

  const openEdit = (d: PlatformDiscipline) => {
    setEditing(d);
    setNameAr(d.name.ar);
    setNameEn(d.name.en);
    setDescAr(d.shortDescription.ar);
    setDescEn(d.shortDescription.en);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr.trim() || !nameEn.trim()) return;
    if (editing) {
      updateDiscipline(editing.slug, {
        name: { ar: nameAr.trim(), en: nameEn.trim() },
        shortDescription: { ar: descAr.trim(), en: descEn.trim() },
      });
    } else {
      createDiscipline({ nameAr, nameEn, descAr, descEn });
    }
    setModalOpen(false);
  };

  const handleDelete = (slug: string) => {
    setDeleteError(null);
    const res = deleteDiscipline(slug);
    if (!res.ok) {
      setDeleteError(t('admin.disciplines.cannotDeleteWithCourses'));
    }
  };

  return (
    <div className="details-stack">
      <StudentPageHeader
        title={t('admin.disciplines.title')}
        subtitle={t('admin.disciplines.subtitle')}
        breadcrumbs={[
          { label: t('admin.nav.overview'), to: '/admin' },
          { label: t('admin.nav.disciplines') },
        ]}
        action={
          <Button variant="primary" onClick={openCreate}>
            <Plus size={16} aria-hidden="true" /> {t('admin.disciplines.createBtn')}
          </Button>
        }
      />

      {deleteError ? (
        <Alert variant="warning" title={t('admin.common.delete')}>
          {deleteError}
        </Alert>
      ) : null}

      <div className="grid-2">
        {disciplines.map((disc) => {
          const linkedCount = courses.filter((c) => c.disciplineSlug === disc.slug).length;
          return (
            <Card key={disc.slug} className="details-stack" style={{ gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className={`accent-badge--${disc.accent}`} style={{ padding: 10, borderRadius: 'var(--radius-md)' }}>
                    <DisciplineIcon name={disc.iconName} size={20} />
                  </div>
                  <div>
                    <h2 className="text-h3">{disc.name[locale]}</h2>
                    <Badge variant="neutral">
                      {t('admin.disciplines.coursesCount', { count: linkedCount })}
                    </Badge>
                  </div>
                </div>
                <AdminStatusBadge status={disc.isActive ? 'active' : 'inactive'} />
              </div>

              <p className="text-small" style={{ color: 'var(--text-secondary)' }}>
                {disc.shortDescription[locale]}
              </p>

              <div className="admin-table__actions">
                <Button size="sm" variant="secondary" onClick={() => openEdit(disc)}>
                  {t('admin.common.edit')}
                </Button>
                <Button
                  size="sm"
                  variant="tertiary"
                  onClick={() => updateDiscipline(disc.slug, { isActive: !disc.isActive })}
                >
                  {disc.isActive ? t('admin.disciplines.deactivate') : t('admin.disciplines.activate')}
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(disc.slug)}>
                  {t('admin.common.delete')}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          editing ? t('admin.disciplines.modal.editTitle') : t('admin.disciplines.modal.createTitle')
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              {t('admin.common.cancel')}
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              {editing ? t('admin.common.save') : t('admin.common.create')}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="details-stack" style={{ gap: 12 }}>
          <Input
            label={t('admin.disciplines.modal.nameAr')}
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
            required
          />
          <Input
            label={t('admin.disciplines.modal.nameEn')}
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            required
          />
          <Textarea
            label={t('admin.disciplines.modal.descAr')}
            rows={2}
            value={descAr}
            onChange={(e) => setDescAr(e.target.value)}
          />
          <Textarea
            label={t('admin.disciplines.modal.descEn')}
            rows={2}
            value={descEn}
            onChange={(e) => setDescEn(e.target.value)}
          />
        </form>
      </Modal>
    </div>
  );
}
