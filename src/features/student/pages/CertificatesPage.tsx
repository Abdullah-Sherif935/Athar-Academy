import { Award } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';
import { BrandLogo } from '../../../components/brand/BrandLogo';
import { Alert, Badge, Button, Card, EmptyState, Modal } from '../../../components/ui';
import { getCourseBySlug } from '../../../data/mock';
import type { StudentCertificate } from '../../../data/mock/student';
import { CertificateCard } from '../components/CertificateCard';
import { CourseProgressBar } from '../components/CourseProgressBar';
import { StudentPageHeader } from '../components/StudentPageHeader';
import { useStudentDemo } from '../context/StudentDemoContext';

export function CertificatesPage() {
  const { t, locale } = useI18n();
  const { certificates, enrolledCourses, getCourseProgress, profile } = useStudentDemo();
  const [previewCert, setPreviewCert] = useState<StudentCertificate | null>(null);
  const [downloadNotice, setDownloadNotice] = useState(false);

  const inProgressEligible = enrolledCourses.filter((rec) => {
    const p = getCourseProgress(rec.courseSlug);
    return p.percent < 100;
  });

  const previewCourse = previewCert ? getCourseBySlug(previewCert.courseSlug) : undefined;

  return (
    <div className="details-stack">
      <StudentPageHeader
        title={t('student.certificates.title')}
        subtitle={t('student.certificates.subtitle')}
        breadcrumbs={[
          { label: t('student.nav.dashboard'), to: '/student' },
          { label: t('student.nav.certificates') },
        ]}
      />

      {downloadNotice ? (
        <Alert variant="info" title={t('common.demoBadge')}>
          {t('student.certificates.downloadAlert')}
        </Alert>
      ) : null}

      <section className="details-stack" style={{ gap: 14 }}>
        <h2 className="text-h2">{t('student.certificates.earnedTitle')}</h2>
        {certificates.length > 0 ? (
          <div className="grid-2">
            {certificates.map((cert) => (
              <CertificateCard
                key={cert.id}
                certificate={cert}
                onView={() => setPreviewCert(cert)}
                onDownloadDemo={() => setDownloadNotice(true)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Award size={24} />}
            title={t('student.certificates.earnedTitle')}
            description={t('student.certificates.emptyEarned')}
          />
        )}
      </section>

      <section className="details-stack" style={{ gap: 14 }}>
        <h2 className="text-h2">{t('student.certificates.inProgressTitle')}</h2>
        <div className="grid-2">
          {inProgressEligible.map((rec) => {
            const course = getCourseBySlug(rec.courseSlug);
            const { percent } = getCourseProgress(rec.courseSlug);
            if (!course) return null;
            return (
              <Card key={rec.courseSlug} className="feature-card" style={{ gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                  <h3 className="text-h3">{course.title[locale]}</h3>
                  <Badge variant="neutral">{t('student.certificates.progressRemaining', { percent: 100 - percent })}</Badge>
                </div>
                <CourseProgressBar percent={percent} />
                <Link
                  to={`/student/courses/${course.slug}/lessons/${rec.lastLessonId}`}
                  className="card-inline-link"
                >
                  {t('student.myLearning.continueBtn')}
                </Link>
              </Card>
            );
          })}
        </div>
      </section>

      <Modal
        isOpen={Boolean(previewCert)}
        onClose={() => setPreviewCert(null)}
        title={t('student.certificates.modalTitle')}
        footer={
          <Button variant="secondary" onClick={() => setPreviewCert(null)}>
            {t('a11y.closeModal')}
          </Button>
        }
      >
        {previewCert ? (
          <div className="certificate-frame">
            <BrandLogo variant="icon" size="md" />
            <Badge variant="warning">{t('student.certificates.previewBadge')}</Badge>
            <h3 className="text-h2">{t('student.certificates.certHeading')}</h3>
            <p className="text-small">{t('student.certificates.certPresentedTo')}</p>
            <div className="text-h2" style={{ color: 'var(--brand-blue)' }}>
              {profile.fullName[locale]}
            </div>
            <p className="text-small">{t('student.certificates.certForCompleting')}</p>
            <div className="text-h3">{previewCourse?.title[locale]}</div>
            <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>
              {t('student.certificates.codeLabel')}{' '}
              <bdi className="ltr-inline">{previewCert.certificateCode}</bdi> ·{' '}
              {previewCert.issuedLabel[locale]}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
