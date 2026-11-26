import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';
import { usePlatformDemo } from '../../../app/providers/PlatformDemoContext';
import { Button, Card, EmptyState, Input, Select } from '../../../components/ui';
import type { StudentAccountStatus } from '../../../data/mock/admin';
import { StudentPageHeader } from '../../student/components/StudentPageHeader';
import { AdminStatusBadge } from '../components/AdminStatusBadge';

export function AdminStudentsPage() {
  const { t, locale } = useI18n();
  const { students, setStudentStatus } = usePlatformDemo();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | StudentAccountStatus>('all');
  const [enrollmentFilter, setEnrollmentFilter] = useState<'all' | 'with' | 'without'>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return students.filter((s) => {
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (enrollmentFilter === 'with' && s.enrolledCourseSlugs.length === 0) return false;
      if (enrollmentFilter === 'without' && s.enrolledCourseSlugs.length > 0) return false;
      if (!q) return true;
      return (
        s.fullName.ar.toLowerCase().includes(q) ||
        s.fullName.en.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
      );
    });
  }, [enrollmentFilter, query, statusFilter, students]);

  return (
    <div className="details-stack">
      <StudentPageHeader
        title={t('admin.students.title')}
        subtitle={t('admin.students.subtitle')}
        breadcrumbs={[
          { label: t('admin.nav.overview'), to: '/admin' },
          { label: t('admin.nav.students') },
        ]}
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
          <div style={{ flex: '0 1 180px' }}>
            <Select
              aria-label={t('admin.students.columns.status')}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | StudentAccountStatus)}
            >
              <option value="all">{t('admin.common.allStatuses')}</option>
              <option value="active">{t('admin.statuses.active')}</option>
              <option value="inactive">{t('admin.statuses.inactive')}</option>
              <option value="suspended">{t('admin.statuses.suspended')}</option>
            </Select>
          </div>
          <div style={{ flex: '0 1 190px' }}>
            <Select
              aria-label={t('admin.students.allEnrolled')}
              value={enrollmentFilter}
              onChange={(e) => setEnrollmentFilter(e.target.value as 'all' | 'with' | 'without')}
            >
              <option value="all">{t('admin.students.allEnrolled')}</option>
              <option value="with">{t('admin.students.withEnrollments')}</option>
              <option value="without">{t('admin.students.withoutEnrollments')}</option>
            </Select>
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Search size={24} />}
          title={t('admin.common.noResults')}
          description={t('admin.students.subtitle')}
        />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('admin.students.columns.student')}</th>
                <th>{t('admin.students.columns.status')}</th>
                <th>{t('admin.students.columns.registered')}</th>
                <th>{t('admin.students.columns.enrolledCourses')}</th>
                <th>{t('admin.students.columns.progress')}</th>
                <th>{t('admin.students.columns.lastActivity')}</th>
                <th>{t('admin.common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student) => (
                <tr key={student.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className="student-avatar-pill__circle" aria-hidden="true">
                        {student.initials}
                      </span>
                      <div>
                        <Link
                          to={`/admin/students/${student.id}`}
                          className="card-title-link"
                          style={{ fontWeight: 700 }}
                        >
                          {student.fullName[locale]}
                        </Link>
                        <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                          <bdi className="ltr-inline">{student.email}</bdi>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <AdminStatusBadge status={student.status} />
                  </td>
                  <td>{student.registeredAt[locale]}</td>
                  <td>{student.enrolledCourseSlugs.length}</td>
                  <td>{student.avgProgress}%</td>
                  <td>{student.lastActivity[locale]}</td>
                  <td>
                    <div className="admin-table__actions">
                      <Link
                        to={`/admin/students/${student.id}`}
                        className="ui-btn ui-btn--secondary ui-btn--sm"
                      >
                        {t('admin.common.viewDetails')}
                      </Link>
                      {student.status !== 'active' ? (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => setStudentStatus(student.id, 'active')}
                        >
                          {t('admin.students.actions.reactivate')}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setStudentStatus(student.id, 'suspended')}
                        >
                          {t('admin.students.actions.suspend')}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
