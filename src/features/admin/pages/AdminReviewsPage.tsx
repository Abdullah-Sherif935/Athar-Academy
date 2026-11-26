import { Star } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useI18n } from '../../../app/providers/I18nProvider';
import { usePlatformDemo } from '../../../app/providers/PlatformDemoContext';
import { Badge, Button, Card, EmptyState, Modal, Select } from '../../../components/ui';
import type { ReviewStatus } from '../../../data/mock/admin';
import { StudentPageHeader } from '../../student/components/StudentPageHeader';
import { AdminStatusBadge } from '../components/AdminStatusBadge';

export function AdminReviewsPage() {
  const { t, locale } = useI18n();
  const { reviews, courses, students, moderateReview, removeReview } = usePlatformDemo();

  const [statusFilter, setStatusFilter] = useState<'all' | ReviewStatus>('all');
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  const filtered = useMemo(
    () => reviews.filter((r) => statusFilter === 'all' || r.status === statusFilter),
    [reviews, statusFilter],
  );

  const ratingsByCourse = useMemo(() => {
    const map = new Map<string, { sum: number; count: number }>();
    reviews.forEach((r) => {
      if (r.status === 'hidden') return;
      const cur = map.get(r.courseSlug) ?? { sum: 0, count: 0 };
      map.set(r.courseSlug, { sum: cur.sum + r.rating, count: cur.count + 1 });
    });
    return Array.from(map.entries()).map(([courseSlug, { sum, count }]) => ({
      course: courses.find((c) => c.slug === courseSlug),
      courseSlug,
      avg: (sum / count).toFixed(1),
      count,
    }));
  }, [courses, reviews]);

  return (
    <div className="details-stack">
      <StudentPageHeader
        title={t('admin.reviews.title')}
        subtitle={t('admin.reviews.subtitle')}
        breadcrumbs={[
          { label: t('admin.nav.overview'), to: '/admin' },
          { label: t('admin.nav.reviews') },
        ]}
      />

      {ratingsByCourse.length > 0 ? (
        <Card className="details-stack" style={{ gap: 12 }}>
          <h2 className="text-h3">{t('admin.reviews.avgRatingsTitle')}</h2>
          <div className="admin-stats-grid">
            {ratingsByCourse.map(({ course, courseSlug, avg, count }) => (
              <div
                key={courseSlug}
                style={{
                  padding: 12,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  background: 'var(--surface-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <div className="text-small" style={{ fontWeight: 700 }}>
                  {course?.title[locale] ?? courseSlug}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Star size={15} style={{ color: 'var(--brand-orange)' }} aria-hidden="true" />
                  <span style={{ fontWeight: 700 }}>{avg}</span>
                  <Badge variant="neutral">({count})</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <Card>
        <div className="admin-filter-bar">
          <div style={{ flex: '0 1 200px' }}>
            <Select
              aria-label={t('admin.reviews.columns.status')}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | ReviewStatus)}
            >
              <option value="all">{t('admin.common.allStatuses')}</option>
              <option value="pending">{t('admin.statuses.pending')}</option>
              <option value="approved">{t('admin.statuses.approved')}</option>
              <option value="hidden">{t('admin.statuses.hidden')}</option>
            </Select>
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Star size={24} />}
          title={t('admin.common.noResults')}
          description={t('admin.reviews.subtitle')}
        />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('admin.reviews.columns.student')}</th>
                <th>{t('admin.reviews.columns.course')}</th>
                <th>{t('admin.reviews.columns.rating')}</th>
                <th>{t('admin.reviews.columns.comment')}</th>
                <th>{t('admin.reviews.columns.status')}</th>
                <th>{t('admin.common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((rev) => {
                const student = students.find((s) => s.id === rev.studentId);
                const course = courses.find((c) => c.slug === rev.courseSlug);
                return (
                  <tr key={rev.id}>
                    <td>{student?.fullName[locale] ?? rev.studentId}</td>
                    <td>{course?.title[locale] ?? rev.courseSlug}</td>
                    <td>
                      <Badge variant="warning">{rev.rating} / 5</Badge>
                    </td>
                    <td style={{ maxWidth: 320 }}>{rev.comment[locale]}</td>
                    <td>
                      <AdminStatusBadge status={rev.status} />
                    </td>
                    <td>
                      <div className="admin-table__actions">
                        {rev.status !== 'approved' ? (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => moderateReview(rev.id, 'approved')}
                          >
                            {t('admin.common.approve')}
                          </Button>
                        ) : null}
                        {rev.status !== 'hidden' ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => moderateReview(rev.id, 'hidden')}
                          >
                            {t('admin.common.hide')}
                          </Button>
                        ) : null}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setConfirmRemoveId(rev.id)}
                        >
                          {t('admin.common.remove')}
                        </Button>
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
        isOpen={Boolean(confirmRemoveId)}
        onClose={() => setConfirmRemoveId(null)}
        title={t('admin.reviews.confirmRemoveTitle')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmRemoveId(null)}>
              {t('admin.common.cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (confirmRemoveId) removeReview(confirmRemoveId);
                setConfirmRemoveId(null);
              }}
            >
              {t('admin.common.remove')}
            </Button>
          </>
        }
      >
        <p className="text-body">{t('admin.reviews.confirmRemoveBody')}</p>
      </Modal>
    </div>
  );
}
