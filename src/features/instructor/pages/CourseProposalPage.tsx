import { ArrowLeft, ArrowRight, BookPlus, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';
import { usePlatformDemo } from '../../../app/providers/PlatformDemoContext';
import { Alert, Button, Card, Input, Select, Textarea } from '../../../components/ui';
import type { CourseCurrency, CourseLanguage, PaymentMethodType } from '../../../data/mock/admin';
import type { CourseLevel } from '../../../data/mock/types';
import { instructorCreateDraftCourse } from '../../../services/courseWorkflowService';
import { StudentPageHeader } from '../../student/components/StudentPageHeader';
import { useInstructorDemo } from '../context/InstructorDemoContext';

const ALL_PAYMENT_METHODS: Array<{ id: PaymentMethodType; ar: string; en: string }> = [
  { id: 'vodafone_cash', ar: 'فودافون كاش', en: 'Vodafone Cash' },
  { id: 'instapay', ar: 'إنستاباي (InstaPay)', en: 'InstaPay' },
  { id: 'bank_transfer', ar: 'تحويل بنكي', en: 'Bank Transfer' },
  { id: 'cash_in_person', ar: 'دفع نقدي مباشر', en: 'Cash in Person' },
];

export function CourseProposalPage() {
  const { t, locale, dir } = useI18n();
  const navigate = useNavigate();
  const isAr = locale === 'ar';

  const { disciplines, getDisciplineDbId } = usePlatformDemo();
  const { isInstructorDisabled, refreshInstructorData } = useInstructorDemo();

  // Basic Information
  const [titleAr, setTitleAr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [shortDescAr, setShortDescAr] = useState('');
  const [shortDescEn, setShortDescEn] = useState('');
  const [fullDescAr, setFullDescAr] = useState('');
  const [fullDescEn, setFullDescEn] = useState('');
  const [disciplineSlug, setDisciplineSlug] = useState(
    disciplines[0]?.slug ?? 'software-technology',
  );
  const [level, setLevel] = useState<CourseLevel>('beginner');
  const [language, setLanguage] = useState<CourseLanguage>('bilingual');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [durationAr, setDurationAr] = useState('6 أسابيع');
  const [durationEn, setDurationEn] = useState('6 Weeks');
  const [outcomesText, setOutcomesText] = useState('');
  const [requirementsText, setRequirementsText] = useState('');
  const [audienceText, setAudienceText] = useState('');

  // Pricing & Direct-to-Instructor Enrollment
  const [isFree, setIsFree] = useState(false);
  const [priceAmount, setPriceAmount] = useState('1500');
  const [currency, setCurrency] = useState<CourseCurrency>('EGP');
  const [enrollmentOpen, setEnrollmentOpen] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodType[]>([
    'vodafone_cash',
    'instapay',
    'bank_transfer',
  ]);
  const [payInstAr, setPayInstAr] = useState(
    'تواصل مع المدرب الرئيسي لتنسيق الدفع المباشر خارج المنصة.',
  );
  const [payInstEn, setPayInstEn] = useState(
    'Contact the Lead Instructor to coordinate direct payment outside the platform.',
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isInstructorDisabled) {
    return (
      <Alert variant="error" title={t('instructor.selfService.revokedTitle')}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <ShieldAlert size={16} aria-hidden="true" />
          {t('instructor.selfService.revokedBody')}
        </span>
      </Alert>
    );
  }

  const toLines = (raw: string) =>
    raw
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => ({ ar: l, en: l }));

  const toggleMethod = (m: PaymentMethodType) => {
    setPaymentMethods((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  };

  const handleCreateDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!titleAr.trim() || !titleEn.trim() || !shortDescAr.trim() || !shortDescEn.trim()) {
      setError(t('instructor.selfService.proposal.validationError'));
      return;
    }

    const disciplineId = getDisciplineDbId(disciplineSlug) ?? getDisciplineDbId(disciplines[0]?.slug ?? '');
    if (!disciplineId) {
      setError(
        isAr
          ? 'تعذر تحميل التخصص من قاعدة البيانات. يرجى تحديث الصفحة والمحاولة مرة أخرى.'
          : 'Unable to resolve discipline from Supabase. Please refresh and try again.',
      );
      return;
    }

    setSubmitting(true);
    const parsedObjectives = toLines(outcomesText);
    const { data, error: createErr } = await instructorCreateDraftCourse({
      disciplineId,
      titleAr: titleAr.trim(),
      titleEn: titleEn.trim(),
      shortDescAr: shortDescAr.trim(),
      shortDescEn: shortDescEn.trim(),
      fullDescAr: fullDescAr.trim() || shortDescAr.trim(),
      fullDescEn: fullDescEn.trim() || shortDescEn.trim(),
      level,
      language,
      durationAr: durationAr.trim() || '6 أسابيع',
      durationEn: durationEn.trim() || '6 Weeks',
      thumbnailUrl: thumbnailUrl.trim() || undefined,
      whatYouWillLearn: parsedObjectives,
      objectives: parsedObjectives,
      requirements: toLines(requirementsText),
      targetAudience: toLines(audienceText),
      isFree,
      priceAmount: isFree ? 0 : Math.max(0, Number(priceAmount) || 0),
      currency,
      paymentMethods: paymentMethods.length > 0 ? paymentMethods : ['vodafone_cash'],
      paymentInstructionsAr: payInstAr.trim(),
      paymentInstructionsEn: payInstEn.trim(),
      enrollmentOpen,
    });

    if (createErr || !data) {
      setSubmitting(false);
      setError(createErr || (isAr ? 'تعذر إنشاء الدورة.' : 'Failed to create course.'));
      return;
    }

    await refreshInstructorData();
    setSubmitting(false);
    navigate(`/instructor/courses/${data.slug}/curriculum`, { replace: true });
  };

  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;

  return (
    <div className="details-stack">
      <StudentPageHeader
        title={isAr ? 'إنشاء دورة جديدة' : 'Create New Course'}
        subtitle={
          isAr
            ? 'أدخل تفاصيل الدورة والتسعير واحفظها كمسودة لبناء المنهج والدروس ثم إرسالها لاعتماد الإدارة.'
            : 'Enter course details and direct-payment pricing, save as Draft, build your curriculum, and submit for Super Admin approval.'
        }
        breadcrumbs={[
          { label: t('instructor.nav.dashboard'), to: '/instructor' },
          { label: t('instructor.nav.courses'), to: '/instructor/courses' },
          { label: isAr ? 'إنشاء دورة جديدة' : 'Create New Course' },
        ]}
        action={
          <Link to="/instructor/courses" className="ui-btn ui-btn--secondary ui-btn--sm">
            <BackIcon size={15} aria-hidden="true" /> {t('instructor.courses.backToCourses')}
          </Link>
        }
      />

      <form onSubmit={handleCreateDraft} className="details-stack" style={{ gap: 18 }}>
        {/* Section 1: Basic Information */}
        <Card className="details-stack" style={{ gap: 14 }}>
          <h2 className="text-h3">{isAr ? '1. المعلومات الأساسية' : '1. Basic Information'}</h2>

          <div className="grid-2">
            <Input
              label={t('instructor.selfService.proposal.titleAr')}
              value={titleAr}
              onChange={(e) => setTitleAr(e.target.value)}
              required
            />
            <Input
              label={t('instructor.selfService.proposal.titleEn')}
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              required
            />
          </div>

          <div className="grid-2">
            <Textarea
              label={t('instructor.selfService.proposal.shortDescAr')}
              rows={2}
              value={shortDescAr}
              onChange={(e) => setShortDescAr(e.target.value)}
              required
            />
            <Textarea
              label={t('instructor.selfService.proposal.shortDescEn')}
              rows={2}
              value={shortDescEn}
              onChange={(e) => setShortDescEn(e.target.value)}
              required
            />
          </div>

          <div className="grid-2">
            <Textarea
              label={t('instructor.selfService.proposal.fullDescAr')}
              rows={3}
              value={fullDescAr}
              onChange={(e) => setFullDescAr(e.target.value)}
            />
            <Textarea
              label={t('instructor.selfService.proposal.fullDescEn')}
              rows={3}
              value={fullDescEn}
              onChange={(e) => setFullDescEn(e.target.value)}
            />
          </div>

          <div className="grid-3">
            <Select
              label={t('instructor.selfService.proposal.discipline')}
              value={disciplineSlug}
              onChange={(e) => setDisciplineSlug(e.target.value)}
            >
              {disciplines.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.name[locale]}
                </option>
              ))}
            </Select>

            <Select
              label={t('instructor.selfService.proposal.level')}
              value={level}
              onChange={(e) => setLevel(e.target.value as CourseLevel)}
            >
              <option value="beginner">{t('common.levels.beginner')}</option>
              <option value="intermediate">{t('common.levels.intermediate')}</option>
              <option value="advanced">{t('common.levels.advanced')}</option>
            </Select>

            <Select
              label={t('instructor.selfService.proposal.language')}
              value={language}
              onChange={(e) => setLanguage(e.target.value as CourseLanguage)}
            >
              <option value="bilingual">Arabic + English</option>
              <option value="ar">العربية (Arabic)</option>
              <option value="en">English</option>
            </Select>
          </div>

          <div className="grid-3">
            <Input
              label={t('instructor.selfService.proposal.durationAr')}
              value={durationAr}
              onChange={(e) => setDurationAr(e.target.value)}
            />
            <Input
              label={t('instructor.selfService.proposal.durationEn')}
              value={durationEn}
              onChange={(e) => setDurationEn(e.target.value)}
            />
            <Input
              label={t('instructor.selfService.proposal.thumbnailUrl')}
              placeholder="https://example.com/course-cover.jpg"
              dir="ltr"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
            />
          </div>

          <div className="grid-3">
            <Textarea
              label={t('instructor.selfService.proposal.outcomes')}
              rows={3}
              value={outcomesText}
              onChange={(e) => setOutcomesText(e.target.value)}
            />
            <Textarea
              label={t('instructor.selfService.proposal.requirements')}
              rows={3}
              value={requirementsText}
              onChange={(e) => setRequirementsText(e.target.value)}
            />
            <Textarea
              label={t('instructor.selfService.proposal.audience')}
              rows={3}
              value={audienceText}
              onChange={(e) => setAudienceText(e.target.value)}
            />
          </div>
        </Card>

        {/* Section 2: Pricing & Direct-to-Instructor Enrollment */}
        <Card className="details-stack" style={{ gap: 14 }}>
          <h2 className="text-h3">
            {isAr ? '2. التسعير وتنسيق الدفع المباشر' : '2. Pricing & Direct-to-Instructor Enrollment'}
          </h2>
          <Alert
            variant="info"
            title={isAr ? 'نموذج الدفع المباشر للمدرب' : 'Direct-to-Instructor Payment Model'}
          >
            {isAr
              ? 'أكاديمية أثر لا تجمع رسوم الدورات؛ يدفع الطالب للمدرب مباشرة خارج المنصة ثم يؤكد المدرب استلام الدفع لتفعيل الوصول.'
              : 'ATHAR ACADEMY does not collect course fees. Students pay you directly outside the platform, and you confirm receipt to activate access.'}
          </Alert>

          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
              />
              <span className="text-small" style={{ fontWeight: 600 }}>
                {isAr ? 'دورة مجانية' : 'Free Course'}
              </span>
            </label>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={enrollmentOpen}
                onChange={(e) => setEnrollmentOpen(e.target.checked)}
              />
              <span className="text-small" style={{ fontWeight: 600 }}>
                {isAr ? 'الالتحاق متاح' : 'Enrollment Open'}
              </span>
            </label>
          </div>

          {!isFree ? (
            <>
              <div className="grid-2">
                <Input
                  label={isAr ? 'سعر الدورة' : 'Price Amount'}
                  type="number"
                  min={0}
                  value={priceAmount}
                  onChange={(e) => setPriceAmount(e.target.value)}
                />
                <Select
                  label={isAr ? 'العملة' : 'Currency'}
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as CourseCurrency)}
                >
                  <option value="EGP">EGP</option>
                  <option value="USD">USD</option>
                  <option value="SAR">SAR</option>
                </Select>
              </div>

              <div>
                <div className="ui-field__label" style={{ marginBlockEnd: 8 }}>
                  {isAr ? 'طرق الدفع المباشر المقبولة' : 'Accepted Direct Payment Methods'}
                </div>
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                  {ALL_PAYMENT_METHODS.map((pm) => (
                    <label
                      key={pm.id}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
                    >
                      <input
                        type="checkbox"
                        checked={paymentMethods.includes(pm.id)}
                        onChange={() => toggleMethod(pm.id)}
                      />
                      <span className="text-small">{isAr ? pm.ar : pm.en}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid-2">
                <Textarea
                  label={isAr ? 'تعليمات الدفع المباشر (عربي)' : 'Direct Payment Instructions (Arabic)'}
                  rows={2}
                  value={payInstAr}
                  onChange={(e) => setPayInstAr(e.target.value)}
                />
                <Textarea
                  label={isAr ? 'تعليمات الدفع المباشر (إنجليزي)' : 'Direct Payment Instructions (English)'}
                  rows={2}
                  value={payInstEn}
                  onChange={(e) => setPayInstEn(e.target.value)}
                />
              </div>
            </>
          ) : null}
        </Card>

        {error ? <Alert variant="error" title={error} /> : null}

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Button type="submit" variant="primary" size="lg" disabled={submitting}>
            <BookPlus size={16} aria-hidden="true" />{' '}
            {submitting
              ? isAr
                ? 'جارٍ الحفظ في قاعدة البيانات...'
                : 'Saving Draft to Supabase...'
              : isAr
                ? 'حفظ كمسودة وبناء المنهج'
                : 'Save Draft & Build Curriculum'}
          </Button>
          <Link to="/instructor/courses" className="ui-btn ui-btn--secondary ui-btn--lg">
            {t('admin.common.cancel')}
          </Link>
        </div>
      </form>
    </div>
  );
}
