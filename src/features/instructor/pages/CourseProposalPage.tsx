import { ArrowLeft, ArrowRight, Send, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';
import { usePlatformDemo } from '../../../app/providers/PlatformDemoContext';
import { Alert, Button, Card, Input, Select, Textarea } from '../../../components/ui';
import type { CourseLanguage } from '../../../data/mock/admin';
import type { CourseLevel } from '../../../data/mock/types';
import { StudentPageHeader } from '../../student/components/StudentPageHeader';
import { useInstructorDemo } from '../context/InstructorDemoContext';

export function CourseProposalPage() {
  const { t, locale, dir } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editProposalId = searchParams.get('proposalId');

  const { disciplines } = usePlatformDemo();
  const { isInstructorDisabled, myProposals, createProposal, updateProposal, submitProposal } =
    useInstructorDemo();

  const existing = editProposalId ? myProposals.find((p) => p.id === editProposalId) : undefined;

  const [titleAr, setTitleAr] = useState(existing?.title.ar ?? '');
  const [titleEn, setTitleEn] = useState(existing?.title.en ?? '');
  const [shortDescAr, setShortDescAr] = useState(existing?.shortDescription.ar ?? '');
  const [shortDescEn, setShortDescEn] = useState(existing?.shortDescription.en ?? '');
  const [fullDescAr, setFullDescAr] = useState(existing?.fullDescription.ar ?? '');
  const [fullDescEn, setFullDescEn] = useState(existing?.fullDescription.en ?? '');
  const [disciplineSlug, setDisciplineSlug] = useState(
    existing?.disciplineSlug ?? disciplines[0]?.slug ?? 'software-technology',
  );
  const [level, setLevel] = useState<CourseLevel>(existing?.level ?? 'beginner');
  const [language, setLanguage] = useState<CourseLanguage>(existing?.language ?? 'bilingual');
  const [thumbnailUrl, setThumbnailUrl] = useState(existing?.thumbnailUrl ?? '');
  const [durationAr, setDurationAr] = useState(existing?.duration.ar ?? '6 أسابيع');
  const [durationEn, setDurationEn] = useState(existing?.duration.en ?? '6 Weeks');
  const [suggestedPrice, setSuggestedPrice] = useState(existing?.suggestedPrice[locale] ?? 'Free (Demo)');
  const [enrollmentNotes, setEnrollmentNotes] = useState(existing?.enrollmentNotes[locale] ?? '');
  const [outcomesText, setOutcomesText] = useState(
    existing?.whatYouWillLearn.map((x) => x[locale]).join('\n') ?? '',
  );
  const [requirementsText, setRequirementsText] = useState(
    existing?.requirements.map((x) => x[locale]).join('\n') ?? '',
  );
  const [audienceText, setAudienceText] = useState(
    existing?.targetAudience.map((x) => x[locale]).join('\n') ?? '',
  );
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

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

  const handleSave = (submitImmediately: boolean) => {
    if (!titleAr.trim() || !titleEn.trim() || !shortDescAr.trim() || !shortDescEn.trim()) {
      setError(t('instructor.selfService.proposal.validationError'));
      setFeedback(null);
      return;
    }

    const payload = {
      title: { ar: titleAr.trim(), en: titleEn.trim() },
      shortDescription: { ar: shortDescAr.trim(), en: shortDescEn.trim() },
      fullDescription: {
        ar: fullDescAr.trim() || shortDescAr.trim(),
        en: fullDescEn.trim() || shortDescEn.trim(),
      },
      disciplineSlug,
      level,
      language,
      thumbnailUrl: thumbnailUrl.trim() || undefined,
      duration: { ar: durationAr.trim() || '6 أسابيع', en: durationEn.trim() || '6 Weeks' },
      suggestedPrice: { ar: suggestedPrice.trim(), en: suggestedPrice.trim() },
      enrollmentNotes: { ar: enrollmentNotes.trim(), en: enrollmentNotes.trim() },
      whatYouWillLearn: toLines(outcomesText),
      requirements: toLines(requirementsText),
      targetAudience: toLines(audienceText),
    };

    if (existing) {
      updateProposal(existing.id, payload);
      if (submitImmediately) {
        submitProposal(existing.id);
      }
    } else {
      createProposal({ ...payload, submitImmediately });
    }

    setError(null);
    setFeedback(
      submitImmediately
        ? t('instructor.selfService.proposal.submittedSuccess')
        : t('instructor.selfService.proposal.savedDraftSuccess'),
    );
    setTimeout(() => navigate('/instructor/courses'), 600);
  };

  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;

  return (
    <div className="details-stack">
      <StudentPageHeader
        title={
          existing
            ? t('instructor.selfService.proposal.reviseTitle')
            : t('instructor.selfService.proposal.pageTitle')
        }
        subtitle={t('instructor.selfService.proposal.pageSubtitle')}
        breadcrumbs={[
          { label: t('instructor.nav.dashboard'), to: '/instructor' },
          { label: t('instructor.nav.courses'), to: '/instructor/courses' },
          { label: t('instructor.selfService.proposeCourseBtn') },
        ]}
        action={
          <Link to="/instructor/courses" className="ui-btn ui-btn--secondary ui-btn--sm">
            <BackIcon size={15} aria-hidden="true" /> {t('instructor.courses.backToCourses')}
          </Link>
        }
      />

      {existing?.status === 'rejected' && existing.rejectionReason ? (
        <Alert variant="error" title={t('admin.statuses.rejected')}>
          {existing.rejectionReason[locale]}
        </Alert>
      ) : null}

      <Card>
        <div className="details-stack" style={{ gap: 14 }}>
          <div className="grid-2">
            <Input
              label={t('instructor.selfService.proposal.titleAr')}
              value={titleAr}
              onChange={(e) => setTitleAr(e.target.value)}
            />
            <Input
              label={t('instructor.selfService.proposal.titleEn')}
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
            />
          </div>

          <div className="grid-2">
            <Textarea
              label={t('instructor.selfService.proposal.shortDescAr')}
              rows={2}
              value={shortDescAr}
              onChange={(e) => setShortDescAr(e.target.value)}
            />
            <Textarea
              label={t('instructor.selfService.proposal.shortDescEn')}
              rows={2}
              value={shortDescEn}
              onChange={(e) => setShortDescEn(e.target.value)}
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
              label={t('instructor.selfService.proposal.suggestedPrice')}
              value={suggestedPrice}
              onChange={(e) => setSuggestedPrice(e.target.value)}
            />
          </div>

          <div className="grid-2">
            <Input
              label={t('instructor.selfService.proposal.thumbnailUrl')}
              placeholder="https://example.com/course-cover.jpg"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
            />
            <Input
              label={t('instructor.selfService.proposal.enrollmentNotes')}
              value={enrollmentNotes}
              onChange={(e) => setEnrollmentNotes(e.target.value)}
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

          {error ? <Alert variant="error" title={error} /> : null}
          {feedback ? <Alert variant="success" title={feedback} /> : null}

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Button variant="secondary" onClick={() => handleSave(false)}>
              {t('instructor.selfService.proposal.saveDraftBtn')}
            </Button>
            <Button variant="primary" onClick={() => handleSave(true)}>
              <Send size={15} aria-hidden="true" /> {t('instructor.selfService.proposal.submitBtn')}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
