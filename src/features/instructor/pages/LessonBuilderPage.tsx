import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Eye,
  FileText,
  FolderSearch,
  Plus,
  Save,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';
import { YouTubeVideoPreview } from '../../../components/shared/YouTubeVideoPreview';
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Modal,
  Select,
  Textarea,
} from '../../../components/ui';
import type { LessonResourceItem, LessonResourceType, LessonType } from '../../../data/mock/admin';
import type { VideoProviderType } from '../../../data/mock/instructor';
import { parseYouTubeUrl } from '../../../utils/youtube';
import { StudentPageHeader } from '../../student/components/StudentPageHeader';
import { LessonStatusBadge } from '../components/LessonStatusBadge';
import { useInstructorDemo } from '../context/InstructorDemoContext';

const PROVIDERS: VideoProviderType[] = [
  'youtube_unlisted',
  'cloudflare_stream',
  'vimeo',
  'custom_hls',
];

export function LessonBuilderPage() {
  const { courseId = '', lessonId = '' } = useParams();
  const { t, locale } = useI18n();
  const { getAssignedCourse, isInstructorDisabled, saveLessonChanges, requireLessonApproval } =
    useInstructorDemo();

  const course = getAssignedCourse(courseId);
  const foundLesson = course?.modules.flatMap((m) => m.lessons).find((l) => l.id === lessonId);

  // If a pending/draft revision exists, load it into the editor while preserving the live published lesson!
  const editorSource = foundLesson?.pendingRevision ?? foundLesson;

  const [title, setTitle] = useState(editorSource?.title[locale] ?? '');
  const [shortDesc, setShortDesc] = useState(editorSource?.shortDescription?.[locale] ?? '');
  const [desc, setDesc] = useState(editorSource?.description[locale] ?? '');
  const [lessonType, setLessonType] = useState<LessonType>(editorSource?.lessonType ?? 'video');
  const [provider, setProvider] = useState<VideoProviderType>(
    editorSource?.videoProvider ?? 'youtube_unlisted',
  );
  const [youtubeUrl, setYoutubeUrl] = useState(editorSource?.videoUrl ?? '');
  const [sourceId, setSourceId] = useState(editorSource?.videoSourceId ?? '');
  const [duration, setDuration] = useState(String(editorSource?.durationMinutes ?? 15));
  const [materials, setMaterials] = useState(editorSource?.materialsNote[locale] ?? '');
  const [isPreview, setIsPreview] = useState(Boolean(editorSource?.isPreview));
  const [resources, setResources] = useState<LessonResourceItem[]>(
    editorSource?.lessonResources ?? [],
  );

  // New resource draft inputs
  const [resTitle, setResTitle] = useState('');
  const [resDesc, setResDesc] = useState('');
  const [resType, setResType] = useState<LessonResourceType>('pdf');
  const [resFile, setResFile] = useState('');

  const [previewOpen, setPreviewOpen] = useState(false);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
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

  if (!course || !foundLesson) {
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

  const ytParsed = youtubeUrl.trim() ? parseYouTubeUrl(youtubeUrl) : null;
  const effectiveVideoId =
    provider === 'youtube_unlisted' && ytParsed?.ok ? ytParsed.videoId : sourceId;

  const handleYoutubeUrlChange = (val: string) => {
    setYoutubeUrl(val);
    setHasUnsaved(true);
    setValidationError(null);
    const parsed = parseYouTubeUrl(val);
    if (parsed.ok) {
      setSourceId(parsed.videoId);
    }
  };

  const handleAddResource = () => {
    if (!resTitle.trim() || !resFile.trim()) return;
    const item: LessonResourceItem = {
      id: `lres-${Date.now()}`,
      title: { ar: resTitle.trim(), en: resTitle.trim() },
      description: { ar: resDesc.trim(), en: resDesc.trim() },
      type: resType,
      fileNameOrUrl: resFile.trim(),
      status: 'attached_demo',
    };
    setResources((prev) => [...prev, item]);
    setResTitle('');
    setResDesc('');
    setResFile('');
    setHasUnsaved(true);
  };

  const moveResource = (idx: number, dir: 'up' | 'down') => {
    const target = dir === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= resources.length) return;
    const next = [...resources];
    const [moved] = next.splice(idx, 1);
    next.splice(target, 0, moved);
    setResources(next);
    setHasUnsaved(true);
  };

  const persist = (mode: 'save_draft' | 'publish_or_submit') => {
    if (!title.trim()) {
      setValidationError(t('instructor.selfService.lessonEditor.titleRequired'));
      return;
    }

    // Validate YouTube URL when provided OR when lessonType requires video and URL is entered
    if (provider === 'youtube_unlisted' && youtubeUrl.trim()) {
      const check = parseYouTubeUrl(youtubeUrl);
      if (!check.ok) {
        setValidationError(t(`instructor.selfService.lessonEditor.youtubeErrors.${check.errorKey}`));
        return;
      }
    } else if (
      lessonType === 'video' &&
      provider === 'youtube_unlisted' &&
      mode === 'publish_or_submit' &&
      !sourceId.trim()
    ) {
      setValidationError(t('instructor.selfService.lessonEditor.youtubeErrors.empty'));
      return;
    }

    const res = saveLessonChanges(
      course.slug,
      foundLesson.id,
      {
        title: { ...foundLesson.title, [locale]: title.trim() },
        shortDescription: {
          ar: shortDesc.trim(),
          en: shortDesc.trim(),
        },
        description: { ...foundLesson.description, [locale]: desc.trim() },
        durationMinutes: Math.max(1, Number(duration) || 15),
        lessonType,
        videoProvider: provider,
        videoUrl: youtubeUrl.trim() || undefined,
        videoSourceId: effectiveVideoId.trim() || foundLesson.videoSourceId,
        materialsNote: { ...foundLesson.materialsNote, [locale]: materials.trim() },
        lessonResources: resources,
        isPreview,
      },
      mode,
    );

    if (!res) return;
    setValidationError(null);
    setHasUnsaved(false);

    if (res.isRevision) {
      setFeedback(
        res.status === 'pending_approval'
          ? t('instructor.selfService.lessonEditor.revisionSubmittedToast')
          : t('instructor.selfService.lessonEditor.revisionSavedToast'),
      );
    } else {
      setFeedback(
        res.status === 'pending_approval'
          ? t('admin.sharedNotice.lessonSubmittedForApproval')
          : res.status === 'published'
            ? t('instructor.lessons.publishedToast')
            : t('instructor.lessons.savedDraftToast'),
      );
    }
  };

  return (
    <div className="details-stack">
      <StudentPageHeader
        title={t('instructor.lessons.builderTitle')}
        subtitle={course.title[locale]}
        breadcrumbs={[
          { label: t('instructor.nav.courses'), to: '/instructor/courses' },
          { label: course.title[locale], to: `/instructor/courses/${course.slug}/curriculum` },
          { label: foundLesson.title[locale] },
        ]}
        action={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {hasUnsaved ? (
              <Badge variant="warning">{t('instructor.selfService.lessonEditor.unsavedChanges')}</Badge>
            ) : null}
            {foundLesson.pendingRevision ? (
              <Badge variant="brand">
                {foundLesson.pendingRevision.status === 'pending_approval'
                  ? t('instructor.selfService.curriculum.pendingRevisionBadge')
                  : t('instructor.selfService.curriculum.draftRevisionBadge')}
              </Badge>
            ) : null}
            <LessonStatusBadge status={foundLesson.status} />
          </div>
        }
      />

      {course.suspended ? (
        <Alert variant="error" title={t('instructor.selfService.suspendedTitle')}>
          {t('instructor.selfService.suspendedBody')}
        </Alert>
      ) : null}

      {foundLesson.status === 'published' ? (
        <Alert
          variant="info"
          title={t('instructor.selfService.lessonEditor.revisionPreservationTitle')}
        >
          {t('instructor.selfService.lessonEditor.revisionPreservationBody')}
        </Alert>
      ) : null}

      {foundLesson.rejectionReason ? (
        <Alert variant="error" title={t('admin.statuses.rejected')}>
          {foundLesson.rejectionReason[locale]}
        </Alert>
      ) : null}

      {foundLesson.pendingRevision?.rejectionReason ? (
        <Alert variant="error" title={t('instructor.selfService.curriculum.rejectedRevisionBadge')}>
          {foundLesson.pendingRevision.rejectionReason[locale]}
        </Alert>
      ) : null}

      <Card className="details-stack" style={{ gap: 16 }}>
        <div className="grid-2">
          <Input
            label={t('instructor.lessons.lessonTitle')}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setHasUnsaved(true);
            }}
          />
          <Select
            label={t('instructor.selfService.curriculum.lessonType')}
            value={lessonType}
            onChange={(e) => {
              setLessonType(e.target.value as LessonType);
              setHasUnsaved(true);
            }}
          >
            <option value="video">{t('instructor.selfService.curriculum.lessonTypes.video')}</option>
            <option value="reading">{t('instructor.selfService.curriculum.lessonTypes.reading')}</option>
            <option value="practice">{t('instructor.selfService.curriculum.lessonTypes.practice')}</option>
            <option value="mixed">{t('instructor.selfService.curriculum.lessonTypes.mixed')}</option>
          </Select>
        </div>

        <Input
          label={t('instructor.selfService.lessonEditor.shortDescLabel')}
          value={shortDesc}
          onChange={(e) => {
            setShortDesc(e.target.value);
            setHasUnsaved(true);
          }}
        />

        <Textarea
          label={t('instructor.lessons.lessonDesc')}
          rows={3}
          value={desc}
          onChange={(e) => {
            setDesc(e.target.value);
            setHasUnsaved(true);
          }}
        />

        <div className="grid-3">
          <Select
            label={t('instructor.lessons.videoProvider')}
            value={provider}
            onChange={(e) => {
              setProvider(e.target.value as VideoProviderType);
              setHasUnsaved(true);
            }}
          >
            {PROVIDERS.map((p) => (
              <option key={p} value={p}>
                {t(`instructor.lessons.providers.${p}`)}
              </option>
            ))}
          </Select>

          <Input
            label={t('instructor.lessons.videoSourceId')}
            value={sourceId}
            onChange={(e) => {
              setSourceId(e.target.value);
              setHasUnsaved(true);
            }}
          />

          <Input
            label={t('instructor.lessons.durationMin')}
            type="number"
            min={1}
            value={duration}
            onChange={(e) => {
              setDuration(e.target.value);
              setHasUnsaved(true);
            }}
          />
        </div>

        {lessonType !== 'reading' && provider === 'youtube_unlisted' ? (
          <div className="details-stack" style={{ gap: 10 }}>
            <Input
              label={t('instructor.selfService.lessonEditor.youtubeUrlLabel')}
              placeholder={t('instructor.selfService.lessonEditor.youtubeUrlPlaceholder')}
              value={youtubeUrl}
              onChange={(e) => handleYoutubeUrlChange(e.target.value)}
              error={
                ytParsed && !ytParsed.ok
                  ? t(`instructor.selfService.lessonEditor.youtubeErrors.${ytParsed.errorKey}`)
                  : undefined
              }
            />
            {ytParsed?.ok ? (
              <YouTubeVideoPreview
                videoId={ytParsed.videoId}
                title={title || foundLesson.title[locale]}
                showThumbnail
                showSecurityNote
              />
            ) : null}
          </div>
        ) : null}

        <Textarea
          label={t('instructor.lessons.materialsNote')}
          rows={2}
          value={materials}
          onChange={(e) => {
            setMaterials(e.target.value);
            setHasUnsaved(true);
          }}
        />

        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={isPreview}
            onChange={(e) => {
              setIsPreview(e.target.checked);
              setHasUnsaved(true);
            }}
          />
          <span className="text-small">{t('instructor.lessons.isPreviewLabel')}</span>
        </label>
      </Card>

      {/* Learning Resources Manager */}
      <Card className="details-stack" style={{ gap: 12 }}>
        <h2 className="text-h3">{t('instructor.selfService.lessonEditor.resourcesTitle')}</h2>
        <Alert variant="info" title={t('common.demoBadge')}>
          {t('instructor.selfService.lessonEditor.resourcesNotice')}
        </Alert>

        {resources.length > 0 ? (
          <div className="details-stack" style={{ gap: 8 }}>
            {resources.map((res, idx) => (
              <div
                key={res.id}
                style={{
                  padding: 10,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  background: 'var(--surface-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 10,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <FileText size={16} style={{ color: 'var(--brand-blue)' }} aria-hidden="true" />
                  <div>
                    <div className="text-small" style={{ fontWeight: 700 }}>
                      {res.title[locale]}
                    </div>
                    <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                      <bdi className="ltr-inline">{res.fileNameOrUrl}</bdi>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Badge variant="neutral">
                    {t(`instructor.selfService.lessonEditor.resTypes.${res.type}`)}
                  </Badge>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={idx === 0}
                    onClick={() => moveResource(idx, 'up')}
                  >
                    <ArrowUp size={13} aria-hidden="true" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={idx === resources.length - 1}
                    onClick={() => moveResource(idx, 'down')}
                  >
                    <ArrowDown size={13} aria-hidden="true" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      setResources((prev) => prev.filter((r) => r.id !== res.id));
                      setHasUnsaved(true);
                    }}
                  >
                    <Trash2 size={13} aria-hidden="true" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <div className="grid-3">
          <Input
            placeholder={t('instructor.selfService.lessonEditor.resTitlePlaceholder')}
            value={resTitle}
            onChange={(e) => setResTitle(e.target.value)}
          />
          <Select
            aria-label={t('instructor.selfService.lessonEditor.addResourceBtn')}
            value={resType}
            onChange={(e) => setResType(e.target.value as LessonResourceType)}
          >
            <option value="pdf">{t('instructor.selfService.lessonEditor.resTypes.pdf')}</option>
            <option value="document">{t('instructor.selfService.lessonEditor.resTypes.document')}</option>
            <option value="presentation">{t('instructor.selfService.lessonEditor.resTypes.presentation')}</option>
            <option value="spreadsheet">{t('instructor.selfService.lessonEditor.resTypes.spreadsheet')}</option>
            <option value="link">{t('instructor.selfService.lessonEditor.resTypes.link')}</option>
          </Select>
          <Input
            placeholder={t('instructor.selfService.lessonEditor.resFilePlaceholder')}
            value={resFile}
            onChange={(e) => setResFile(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <Input
              placeholder={t('instructor.selfService.lessonEditor.resDescPlaceholder')}
              value={resDesc}
              onChange={(e) => setResDesc(e.target.value)}
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={!resTitle.trim() || !resFile.trim()}
            onClick={handleAddResource}
          >
            <Plus size={14} aria-hidden="true" /> {t('instructor.selfService.lessonEditor.addResourceBtn')}
          </Button>
        </div>
      </Card>

      {validationError ? <Alert variant="error" title={validationError} /> : null}
      {feedback ? <Alert variant="success" title={feedback} /> : null}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Button variant="secondary" onClick={() => persist('save_draft')}>
          <Save size={15} aria-hidden="true" /> {t('instructor.lessons.saveDraftBtn')}
        </Button>
        <Button
          variant="primary"
          disabled={Boolean(course.suspended)}
          onClick={() => persist('publish_or_submit')}
        >
          <CheckCircle2 size={15} aria-hidden="true" />{' '}
          {requireLessonApproval || foundLesson.status === 'published'
            ? t('instructor.selfService.lessonEditor.submitForApprovalBtn')
            : t('instructor.selfService.lessonEditor.publishDirectBtn')}
        </Button>
        <Button variant="tertiary" onClick={() => setPreviewOpen(true)}>
          <Eye size={15} aria-hidden="true" /> {t('instructor.lessons.previewBtn')}
        </Button>
      </div>

      <Modal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={t('instructor.lessons.previewModalTitle')}
      >
        <div className="details-stack" style={{ gap: 12 }}>
          <YouTubeVideoPreview
            videoId={effectiveVideoId}
            title={title || foundLesson.title[locale]}
            showSecurityNote
          />
          <p className="text-body">{desc}</p>
          {materials ? (
            <Alert variant="info" title={t('instructor.lessons.materialsNote')}>
              {materials}
            </Alert>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}
