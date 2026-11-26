import { MessageSquareWarning } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useI18n } from '../../../app/providers/I18nProvider';
import { usePlatformDemo } from '../../../app/providers/PlatformDemoContext';
import { Badge, Button, Card, EmptyState, Modal, Select } from '../../../components/ui';
import { StudentPageHeader } from '../../student/components/StudentPageHeader';

export function AdminCommunityPage() {
  const { t, locale } = useI18n();
  const {
    communityPosts,
    courses,
    moderationLog,
    toggleHideCommunityPost,
    removeCommunityPost,
  } = usePlatformDemo();

  const [courseFilter, setCourseFilter] = useState('all');
  const [reportedOnly, setReportedOnly] = useState(false);
  const [removeId, setRemoveId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      communityPosts.filter((p) => {
        if (courseFilter !== 'all' && p.courseSlug !== courseFilter) return false;
        if (reportedOnly && !p.isReported) return false;
        return true;
      }),
    [communityPosts, courseFilter, reportedOnly],
  );

  return (
    <div className="details-stack">
      <StudentPageHeader
        title={t('admin.community.title')}
        subtitle={t('admin.community.subtitle')}
        breadcrumbs={[
          { label: t('admin.nav.overview'), to: '/admin' },
          { label: t('admin.nav.community') },
        ]}
      />

      <Card>
        <div className="admin-filter-bar">
          <div style={{ flex: '0 1 260px' }}>
            <Select
              aria-label={t('admin.common.allCourses')}
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
            >
              <option value="all">{t('admin.common.allCourses')}</option>
              {courses.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.title[locale]}
                </option>
              ))}
            </Select>
          </div>
          <label className="admin-checkbox-card" style={{ padding: '8px 12px' }}>
            <input
              type="checkbox"
              checked={reportedOnly}
              onChange={(e) => setReportedOnly(e.target.checked)}
            />
            <span className="text-small">{t('admin.community.reportedOnly')}</span>
          </label>
        </div>
      </Card>

      <div className="details-layout">
        <div className="details-stack" style={{ gap: 12 }}>
          <h2 className="text-h3">{t('admin.community.postsTitle')}</h2>
          {filtered.length === 0 ? (
            <EmptyState
              icon={<MessageSquareWarning size={24} />}
              title={t('admin.common.noResults')}
              description={t('admin.community.subtitle')}
            />
          ) : (
            filtered.map((post) => {
              const course = courses.find((c) => c.slug === post.courseSlug);
              return (
                <Card key={post.id} className="details-stack" style={{ gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className="student-avatar-pill__circle" aria-hidden="true">
                        {post.initials}
                      </span>
                      <div>
                        <div className="text-small" style={{ fontWeight: 700 }}>
                          {post.authorName[locale]}
                        </div>
                        <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                          {course?.title[locale] ?? post.courseSlug} · {post.timeLabel[locale]}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {post.isReported ? (
                        <Badge variant="error">{t('admin.community.reportedBadge')}</Badge>
                      ) : null}
                      {post.isHidden ? (
                        <Badge variant="neutral">{t('admin.community.hiddenBadge')}</Badge>
                      ) : null}
                    </div>
                  </div>

                  {post.title ? <div className="text-h3">{post.title[locale]}</div> : null}
                  <p className="text-body" style={{ opacity: post.isHidden ? 0.6 : 1 }}>
                    {post.content[locale]}
                  </p>

                  <div className="admin-table__actions">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => toggleHideCommunityPost(post.id)}
                    >
                      {post.isHidden ? t('admin.common.restore') : t('admin.common.hide')}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => setRemoveId(post.id)}>
                      {t('admin.common.remove')}
                    </Button>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        <aside className="details-sidebar">
          <Card className="details-stack" style={{ gap: 10 }}>
            <h2 className="text-h3">{t('admin.community.logTitle')}</h2>
            {moderationLog.map((entry) => (
              <div
                key={entry.id}
                style={{
                  padding: 10,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  background: 'var(--surface-subtle)',
                }}
              >
                <div className="text-small" style={{ fontWeight: 600 }}>
                  {entry.action[locale]}
                </div>
                <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                  {entry.target[locale]} · {entry.timestamp[locale]}
                </div>
              </div>
            ))}
          </Card>
        </aside>
      </div>

      <Modal
        isOpen={Boolean(removeId)}
        onClose={() => setRemoveId(null)}
        title={t('admin.community.confirmRemoveTitle')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setRemoveId(null)}>
              {t('admin.common.cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (removeId) removeCommunityPost(removeId);
                setRemoveId(null);
              }}
            >
              {t('admin.common.remove')}
            </Button>
          </>
        }
      >
        <p className="text-body">{t('admin.community.confirmRemoveBody')}</p>
      </Modal>
    </div>
  );
}
