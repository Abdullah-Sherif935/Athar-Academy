import { FolderSearch } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';
import { Alert, Button, Card, EmptyState, Input, Select, Textarea } from '../../../components/ui';
import { MOCK_DISCIPLINES, type CourseLevel } from '../../../data/mock';
import type { CourseCurrency, PaymentMethodType } from '../../../data/mock/admin';
import { StudentPageHeader } from '../../student/components/StudentPageHeader';
import { useInstructorDemo } from '../context/InstructorDemoContext';

const ALL_PAYMENT_METHODS: PaymentMethodType[] = [
  'vodafone_cash',
  'instapay',
  'bank_transfer',
  'cash_in_person',
  'other',
];

export function EditCoursePage() {
  const { courseId = '' } = useParams();
  const { t, locale } = useI18n();
  const { getAssignedCourse, updateCourseMetadata, updateCoursePricing, canConfirmPaymentForCourse } =
    useInstructorDemo();

  const course = getAssignedCourse(courseId);
  const canEditPricing = course ? canConfirmPaymentForCourse(course.slug) : false;

  const [isFree, setIsFree] = useState(course?.pricing.isFree ?? false);
  const [priceAmount, setPriceAmount] = useState(String(course?.pricing.priceAmount ?? 1500));
  const [currency, setCurrency] = useState<CourseCurrency>(course?.pricing.currency ?? 'EGP');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodType[]>(
    course?.pricing.paymentMethods ?? ['vodafone_cash', 'instapay'],
  );
  const [paymentInstructions, setPaymentInstructions] = useState(
    course?.pricing.paymentInstructions[locale] ?? '',
  );
  const [enrollmentOpen, setEnrollmentOpen] = useState(course?.pricing.enrollmentOpen ?? true);
  const [pricingSaved, setPricingSaved] = useState(false);

  const [title, setTitle] = useState(course?.title[locale] ?? '');
  const [shortDesc, setShortDesc] = useState(course?.shortDescription[locale] ?? '');
  const [fullDesc, setFullDesc] = useState(course?.fullDescription[locale] ?? '');
  const [disciplineSlug, setDisciplineSlug] = useState(course?.disciplineSlug ?? '');
  const [level, setLevel] = useState<CourseLevel>(course?.level ?? 'beginner');
  const [duration, setDuration] = useState(course?.duration[locale] ?? '');
  const [objectivesText, setObjectivesText] = useState(
    course?.objectives.map((o) => o[locale]).join('\n') ?? '',
  );
  const [requirementsText, setRequirementsText] = useState(
    course?.requirements.map((r) => r[locale]).join('\n') ?? '',
  );
  const [audienceText, setAudienceText] = useState(
    course?.targetAudience.map((a) => a[locale]).join('\n') ?? '',
  );
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  if (!course) {
    return (
      <EmptyState
        icon={<FolderSearch size={24} />}
        title={t('instructor.courses.notAssignedTitle')}
        description={t('instructor.courses.notAssignedDesc')}
        action={
          <Link to="/instructor/courses" className="ui-btn ui-btn--primary ui-btn--md">
            {t('instructor.courses.backToCourses')}
          </Link>
        }
      />
    );
  }

  const toBilingualLines = (text: string) =>
    text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => ({ ar: line, en: line }));

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !shortDesc.trim() || !fullDesc.trim() || !duration.trim()) {
      setError(t('instructor.editCourse.validationError'));
      setSaved(false);
      return;
    }

    updateCourseMetadata(course.slug, {
      title: { ...course.title, [locale]: title.trim() },
      shortDescription: { ...course.shortDescription, [locale]: shortDesc.trim() },
      fullDescription: { ...course.fullDescription, [locale]: fullDesc.trim() },
      disciplineSlug,
      level,
      duration: { ...course.duration, [locale]: duration.trim() },
      objectives: toBilingualLines(objectivesText),
      requirements: toBilingualLines(requirementsText),
      targetAudience: toBilingualLines(audienceText),
    });
    setError(null);
    setSaved(true);
  };

  return (
    <div className="details-stack">
      <StudentPageHeader
        title={t('instructor.editCourse.title')}
        subtitle={t('instructor.editCourse.subtitle')}
        breadcrumbs={[
          { label: t('instructor.nav.courses'), to: '/instructor/courses' },
          { label: course.title[locale], to: `/instructor/courses/${course.slug}` },
          { label: t('instructor.courses.editBtn') },
        ]}
      />

      <Card>
        <form onSubmit={handleSubmit} className="modal-form" noValidate>
          <Input
            label={t('instructor.editCourse.titleLabel')}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setSaved(false);
            }}
          />
          <Textarea
            label={t('instructor.editCourse.shortDescLabel')}
            value={shortDesc}
            onChange={(e) => {
              setShortDesc(e.target.value);
              setSaved(false);
            }}
          />
          <Textarea
            label={t('instructor.editCourse.fullDescLabel')}
            value={fullDesc}
            onChange={(e) => {
              setFullDesc(e.target.value);
              setSaved(false);
            }}
          />

          <div className="grid-3">
            <div className="ui-field">
              <label htmlFor="edit-discipline" className="ui-field__label">
                {t('instructor.editCourse.disciplineLabel')}
              </label>
              <select
                id="edit-discipline"
                className="filter-select"
                value={disciplineSlug}
                onChange={(e) => setDisciplineSlug(e.target.value)}
              >
                {MOCK_DISCIPLINES.map((d) => (
                  <option key={d.slug} value={d.slug}>
                    {d.name[locale]}
                  </option>
                ))}
              </select>
            </div>

            <div className="ui-field">
              <label htmlFor="edit-level" className="ui-field__label">
                {t('instructor.editCourse.levelLabel')}
              </label>
              <select
                id="edit-level"
                className="filter-select"
                value={level}
                onChange={(e) => setLevel(e.target.value as CourseLevel)}
              >
                <option value="beginner">{t('common.levels.beginner')}</option>
                <option value="intermediate">{t('common.levels.intermediate')}</option>
                <option value="advanced">{t('common.levels.advanced')}</option>
              </select>
            </div>

            <Input
              label={t('instructor.editCourse.durationLabel')}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>

          <Textarea
            label={t('instructor.editCourse.objectivesLabel')}
            value={objectivesText}
            onChange={(e) => setObjectivesText(e.target.value)}
          />
          <Textarea
            label={t('instructor.editCourse.requirementsLabel')}
            value={requirementsText}
            onChange={(e) => setRequirementsText(e.target.value)}
          />
          <Textarea
            label={t('instructor.editCourse.audienceLabel')}
            value={audienceText}
            onChange={(e) => setAudienceText(e.target.value)}
          />

          <Alert variant="info" title={t('instructor.courses.assignedInstructors')}>
            {t('instructor.editCourse.assignedNote')}
          </Alert>

          {error ? <Alert variant="error" title={error} /> : null}
          {saved ? <Alert variant="success" title={t('instructor.editCourse.savedSuccess')} /> : null}

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Button type="submit" variant="primary" size="md">
              {t('instructor.editCourse.saveBtn')}
            </Button>
            <Link
              to={`/instructor/courses/${course.slug}`}
              className="ui-btn ui-btn--secondary ui-btn--md"
            >
              {t('instructor.courses.manageBtn')}
            </Link>
          </div>
        </form>
      </Card>

      {/* Course Enrollment & Pricing Settings (Lead Instructor / Authorized Manager) */}
      <Card className="details-stack" style={{ gap: 14 }}>
        <h2 className="text-h3">{t('instructor.selfService.enrollments.pricingTitle')}</h2>
        <Alert variant="info" title={t('instructor.selfService.enrollments.businessNoticeTitle')}>
          {t('instructor.selfService.enrollments.priceSnapshotHint')}
        </Alert>

        {!canEditPricing ? (
          <Alert variant="warning" title={t('instructor.selfService.enrollments.coInstructorNotice')} />
        ) : null}

        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <input
            type="checkbox"
            disabled={!canEditPricing}
            checked={isFree}
            onChange={(e) => {
              setIsFree(e.target.checked);
              setPricingSaved(false);
            }}
          />
          <span className="text-small">{t('instructor.selfService.enrollments.isFreeLabel')}</span>
        </label>

        {!isFree ? (
          <div className="grid-2">
            <Input
              label={t('instructor.selfService.enrollments.priceAmountLabel')}
              type="number"
              min={0}
              disabled={!canEditPricing}
              value={priceAmount}
              onChange={(e) => {
                setPriceAmount(e.target.value);
                setPricingSaved(false);
              }}
            />
            <Select
              label={t('instructor.selfService.enrollments.currencyLabel')}
              disabled={!canEditPricing}
              value={currency}
              onChange={(e) => {
                setCurrency(e.target.value as CourseCurrency);
                setPricingSaved(false);
              }}
            >
              <option value="EGP">EGP (ج.م)</option>
              <option value="USD">USD ($)</option>
              <option value="SAR">SAR (ر.س)</option>
            </Select>
          </div>
        ) : null}

        {!isFree ? (
          <div>
            <div className="text-small" style={{ fontWeight: 600, marginBlockEnd: 8 }}>
              {t('instructor.selfService.enrollments.paymentMethodsLabel')}
            </div>
            <div className="admin-checkbox-grid">
              {ALL_PAYMENT_METHODS.map((pm) => (
                <label key={pm} className="admin-checkbox-card">
                  <input
                    type="checkbox"
                    disabled={!canEditPricing}
                    checked={paymentMethods.includes(pm)}
                    onChange={() => {
                      setPaymentMethods((prev) =>
                        prev.includes(pm) ? prev.filter((m) => m !== pm) : [...prev, pm],
                      );
                      setPricingSaved(false);
                    }}
                  />
                  <span className="text-small">{t(`admin.paymentMethods.${pm}`)}</span>
                </label>
              ))}
            </div>
          </div>
        ) : null}

        <Textarea
          label={t('instructor.selfService.enrollments.paymentInstructionsLabel')}
          rows={3}
          disabled={!canEditPricing}
          value={paymentInstructions}
          onChange={(e) => {
            setPaymentInstructions(e.target.value);
            setPricingSaved(false);
          }}
        />

        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <input
            type="checkbox"
            disabled={!canEditPricing}
            checked={enrollmentOpen}
            onChange={(e) => {
              setEnrollmentOpen(e.target.checked);
              setPricingSaved(false);
            }}
          />
          <span className="text-small">{t('instructor.selfService.enrollments.enrollmentOpenLabel')}</span>
        </label>

        {pricingSaved ? (
          <Alert variant="success" title={t('instructor.selfService.enrollments.pricingSaved')} />
        ) : null}

        <div>
          <Button
            type="button"
            variant="primary"
            disabled={!canEditPricing}
            onClick={() => {
              updateCoursePricing(course.slug, {
                ...course.pricing,
                isFree,
                priceAmount: isFree ? 0 : Math.max(0, Number(priceAmount) || 0),
                currency,
                paymentMethods,
                paymentInstructions: {
                  ...course.pricing.paymentInstructions,
                  [locale]: paymentInstructions.trim(),
                },
                enrollmentOpen,
              });
              setPricingSaved(true);
            }}
          >
            {t('instructor.selfService.enrollments.savePricingBtn')}
          </Button>
        </div>
      </Card>
    </div>
  );
}
