import { Award, Download, Eye } from 'lucide-react';
import { useI18n } from '../../../app/providers/I18nProvider';
import { Badge, Button, Card } from '../../../components/ui';
import { getCourseBySlug } from '../../../data/mock';
import type { StudentCertificate } from '../../../data/mock/student';

export function CertificateCard({
  certificate,
  onView,
  onDownloadDemo,
}: {
  certificate: StudentCertificate;
  onView: () => void;
  onDownloadDemo: () => void;
}) {
  const { t, locale } = useI18n();
  const course = getCourseBySlug(certificate.courseSlug);

  return (
    <Card className="feature-card" style={{ gap: 14 }}>
      <div className="section-header__meta">
        <div className="feature-card__icon feature-card__icon--orange" aria-hidden="true">
          <Award size={22} />
        </div>
        <Badge variant="warning">{t('student.certificates.previewBadge')}</Badge>
      </div>

      <h3 className="text-h3">{course?.title[locale]}</h3>

      <div className="meta-kv-list">
        <div className="meta-kv-row">
          <span>{t('student.certificates.codeLabel')}</span>
          <span>
            <bdi className="ltr-inline">{certificate.certificateCode}</bdi>
          </span>
        </div>
        <div className="meta-kv-row">
          <span>{t('student.certificates.issuedLabel')}</span>
          <span>{certificate.issuedLabel[locale]}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Button variant="primary" size="sm" onClick={onView}>
          <Eye size={15} aria-hidden="true" /> {t('student.certificates.viewCertificate')}
        </Button>
        <Button variant="secondary" size="sm" onClick={onDownloadDemo}>
          <Download size={15} aria-hidden="true" /> {t('student.certificates.downloadDemo')}
        </Button>
      </div>
    </Card>
  );
}
