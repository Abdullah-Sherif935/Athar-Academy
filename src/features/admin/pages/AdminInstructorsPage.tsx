import { Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';
import { usePlatformDemo } from '../../../app/providers/PlatformDemoContext';
import { Badge, Button, Card, EmptyState, Input, Modal, Select } from '../../../components/ui';
import type { InstructorAccountStatus } from '../../../data/mock/admin';
import { StudentPageHeader } from '../../student/components/StudentPageHeader';
import { AdminStatusBadge } from '../components/AdminStatusBadge';

export function AdminInstructorsPage() {
  const { t, locale } = useI18n();
  const { instructors, courses, inviteInstructor, setInstructorStatus } = usePlatformDemo();

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | InstructorAccountStatus>('all');
  const [inviteOpen, setInviteOpen] = useState(false);

  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [email, setEmail] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return instructors.filter((inst) => {
      if (statusFilter !== 'all' && inst.status !== statusFilter) return false;
      if (!q) return true;
      return (
        inst.name.ar.toLowerCase().includes(q) ||
        inst.name.en.toLowerCase().includes(q) ||
        inst.email.toLowerCase().includes(q)
      );
    });
  }, [instructors, query, statusFilter]);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr.trim() || !nameEn.trim() || !email.trim()) return;
    inviteInstructor({
      nameAr,
      nameEn,
      titleAr: titleAr || nameAr,
      titleEn: titleEn || nameEn,
      email,
    });
    setNameAr('');
    setNameEn('');
    setTitleAr('');
    setTitleEn('');
    setEmail('');
    setInviteOpen(false);
  };

  return (
    <div className="details-stack">
      <StudentPageHeader
        title={t('admin.instructors.title')}
        subtitle={t('admin.instructors.subtitle')}
        breadcrumbs={[
          { label: t('admin.nav.overview'), to: '/admin' },
          { label: t('admin.nav.instructors') },
        ]}
        action={
          <Button variant="primary" onClick={() => setInviteOpen(true)}>
            <Plus size={16} aria-hidden="true" /> {t('admin.instructors.inviteBtn')}
          </Button>
        }
      />

      <Card>
        <div className="admin-filter-bar">
          <div style={{ flex: '1 1 240px' }}>
            <Input
              aria-label={t('admin.common.searchPlaceholder')}
              placeholder={t('admin.common.searchPlaceholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div style={{ flex: '0 1 190px' }}>
            <Select
              aria-label={t('admin.instructors.columns.status')}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | InstructorAccountStatus)}
            >
              <option value="all">{t('admin.common.allStatuses')}</option>
              <option value="active">{t('admin.statuses.active')}</option>
              <option value="inactive">{t('admin.statuses.inactive')}</option>
              <option value="revoked">{t('admin.statuses.revoked')}</option>
            </Select>
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Search size={24} />}
          title={t('admin.common.noResults')}
          description={t('admin.instructors.subtitle')}
        />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('admin.instructors.columns.instructor')}</th>
                <th>{t('admin.instructors.columns.email')}</th>
                <th>{t('admin.instructors.columns.assignedCourses')}</th>
                <th>{t('admin.instructors.columns.status')}</th>
                <th>{t('admin.instructors.columns.joined')}</th>
                <th>{t('admin.common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inst) => {
                const assignedCount = courses.filter((c) =>
                  c.instructorSlugs.includes(inst.slug),
                ).length;
                return (
                  <tr key={inst.slug}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span className="student-avatar-pill__circle" aria-hidden="true">
                          {inst.initials}
                        </span>
                        <div>
                          <Link
                            to={`/admin/instructors/${inst.slug}`}
                            className="card-title-link"
                            style={{ fontWeight: 700 }}
                          >
                            {inst.name[locale]}
                          </Link>
                          <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                            {inst.title[locale]}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <bdi className="ltr-inline">{inst.email}</bdi>
                    </td>
                    <td>
                      <Badge variant="brand">{assignedCount}</Badge>
                    </td>
                    <td>
                      <AdminStatusBadge status={inst.status} />
                    </td>
                    <td>{inst.joinedDate[locale]}</td>
                    <td>
                      <div className="admin-table__actions">
                        <Link
                          to={`/admin/instructors/${inst.slug}`}
                          className="ui-btn ui-btn--secondary ui-btn--sm"
                        >
                          {t('admin.common.viewDetails')}
                        </Link>
                        {inst.status !== 'active' ? (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => setInstructorStatus(inst.slug, 'active')}
                          >
                            {t('admin.instructors.actions.activate')}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="tertiary"
                            onClick={() => setInstructorStatus(inst.slug, 'inactive')}
                          >
                            {t('admin.instructors.actions.deactivate')}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title={t('admin.instructors.inviteModal.title')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setInviteOpen(false)}>
              {t('admin.common.cancel')}
            </Button>
            <Button variant="primary" onClick={handleInvite}>
              {t('admin.instructors.inviteModal.submit')}
            </Button>
          </>
        }
      >
        <form onSubmit={handleInvite} className="details-stack" style={{ gap: 12 }}>
          <Input
            label={t('admin.instructors.inviteModal.nameAr')}
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
            required
          />
          <Input
            label={t('admin.instructors.inviteModal.nameEn')}
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            required
          />
          <Input
            label={t('admin.instructors.inviteModal.titleAr')}
            value={titleAr}
            onChange={(e) => setTitleAr(e.target.value)}
          />
          <Input
            label={t('admin.instructors.inviteModal.titleEn')}
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
          />
          <Input
            label={t('admin.instructors.inviteModal.email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </form>
      </Modal>
    </div>
  );
}
