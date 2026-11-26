import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  Copy,
  Edit3,
  Eye,
  FolderSearch,
  GripVertical,
  Plus,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useI18n } from '../../../app/providers/I18nProvider';
import { Alert, Badge, Button, Card, EmptyState, Input, Modal, Select } from '../../../components/ui';
import type { LessonType } from '../../../data/mock/admin';
import { StudentPageHeader } from '../../student/components/StudentPageHeader';
import { LessonStatusBadge } from '../components/LessonStatusBadge';
import { useInstructorDemo } from '../context/InstructorDemoContext';

export function LessonManagementPage() {
  const { courseId = '' } = useParams();
  const { t, locale } = useI18n();
  const {
    getAssignedCourse,
    isInstructorDisabled,
    addModule,
    updateModule,
    deleteModule,
    reorderModules,
    addLesson,
    deleteLesson,
    duplicateLesson,
    reorderLessons,
    moveLessonToModule,
    moveLesson,
  } = useInstructorDemo();

  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newModuleDesc, setNewModuleDesc] = useState('');
  const [lessonDrafts, setLessonDrafts] = useState<Record<string, string>>({});
  const [lessonTypes, setLessonTypes] = useState<Record<string, LessonType>>({});
  const [collapsedModules, setCollapsedModules] = useState<Record<string, boolean>>({});
  const [editingModule, setEditingModule] = useState<{
    id: string;
    title: string;
    description: string;
  } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<
    { type: 'module'; moduleId: string } | { type: 'lesson'; moduleId: string; lessonId: string } | null
  >(null);

  // Drag & drop state
  const [draggedModuleIdx, setDraggedModuleIdx] = useState<number | null>(null);
  const [draggedLesson, setDraggedLesson] = useState<{ moduleId: string; idx: number } | null>(null);

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

  const course = getAssignedCourse(courseId);

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

  const handleAddModule = (event: FormEvent) => {
    event.preventDefault();
    if (!newModuleTitle.trim()) return;
    addModule(course.slug, newModuleTitle, newModuleDesc);
    setNewModuleTitle('');
    setNewModuleDesc('');
  };

  const handleSaveModuleEdit = () => {
    if (!editingModule || !editingModule.title.trim()) return;
    const mod = course.modules.find((m) => m.id === editingModule.id);
    if (!mod) return;
    updateModule(course.slug, editingModule.id, {
      title: { ...mod.title, [locale]: editingModule.title.trim() },
      description: editingModule.description.trim()
        ? { ar: editingModule.description.trim(), en: editingModule.description.trim() }
        : undefined,
    });
    setEditingModule(null);
  };

  const handleConfirmDelete = () => {
    if (!confirmDelete) return;
    if (confirmDelete.type === 'module') {
      deleteModule(course.slug, confirmDelete.moduleId);
    } else {
      deleteLesson(course.slug, confirmDelete.moduleId, confirmDelete.lessonId);
    }
    setConfirmDelete(null);
  };

  return (
    <div className="details-stack">
      <StudentPageHeader
        title={t('instructor.selfService.curriculum.title')}
        subtitle={t('instructor.selfService.curriculum.subtitle')}
        breadcrumbs={[
          { label: t('instructor.nav.courses'), to: '/instructor/courses' },
          { label: course.title[locale], to: `/instructor/courses/${course.slug}` },
          { label: t('instructor.selfService.workspace.tabs.curriculum') },
        ]}
        action={
          <Link
            to={`/instructor/courses/${course.slug}/preview`}
            className="ui-btn ui-btn--secondary ui-btn--sm"
          >
            <Eye size={15} aria-hidden="true" />{' '}
            {t('instructor.selfService.workspace.openCoursePreview')}
          </Link>
        }
      />

      {course.suspended ? (
        <Alert variant="error" title={t('instructor.selfService.suspendedTitle')}>
          {t('instructor.selfService.suspendedBody')}
        </Alert>
      ) : null}

      {/* Add Module */}
      <Card>
        <form onSubmit={handleAddModule} className="details-stack" style={{ gap: 10 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: '1 1 220px' }}>
              <Input
                label={t('instructor.lessons.addModuleTitle')}
                value={newModuleTitle}
                onChange={(e) => setNewModuleTitle(e.target.value)}
                placeholder={t('instructor.lessons.modulePlaceholder')}
              />
            </div>
            <div style={{ flex: '1 1 220px' }}>
              <Input
                aria-label={t('instructor.selfService.curriculum.addModuleDescPlaceholder')}
                value={newModuleDesc}
                onChange={(e) => setNewModuleDesc(e.target.value)}
                placeholder={t('instructor.selfService.curriculum.addModuleDescPlaceholder')}
              />
            </div>
            <Button type="submit" variant="primary" size="md" disabled={!newModuleTitle.trim()}>
              <Plus size={15} aria-hidden="true" /> {t('instructor.lessons.addModuleBtn')}
            </Button>
          </div>
          <span className="text-caption" style={{ color: 'var(--text-secondary)' }}>
            {t('instructor.selfService.curriculum.dragHint')}
          </span>
        </form>
      </Card>

      {/* Modules & Lessons */}
      {course.modules.map((mod, modIdx) => {
        const isCollapsed = Boolean(collapsedModules[mod.id]);
        return (
          <div
            key={mod.id}
            draggable
            onDragStart={() => setDraggedModuleIdx(modIdx)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (draggedModuleIdx !== null && draggedModuleIdx !== modIdx) {
                reorderModules(course.slug, draggedModuleIdx, modIdx);
              }
              setDraggedModuleIdx(null);
            }}
          >
            <Card className="details-stack" style={{ gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <GripVertical size={16} style={{ color: 'var(--text-secondary)', cursor: 'grab' }} aria-hidden="true" />
                  <div>
                    <h2 className="text-h3">{mod.title[locale]}</h2>
                    {mod.description?.[locale] ? (
                      <p className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                        {mod.description[locale]}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <Badge variant="neutral">
                    {t('common.lessonsCount', { count: mod.lessons.length })}
                  </Badge>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={modIdx === 0}
                    aria-label={t('instructor.lessons.moveUp')}
                    onClick={() => reorderModules(course.slug, modIdx, modIdx - 1)}
                  >
                    <ArrowUp size={13} aria-hidden="true" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={modIdx === course.modules.length - 1}
                    aria-label={t('instructor.lessons.moveDown')}
                    onClick={() => reorderModules(course.slug, modIdx, modIdx + 1)}
                  >
                    <ArrowDown size={13} aria-hidden="true" />
                  </Button>
                  <Button
                    size="sm"
                    variant="tertiary"
                    onClick={() =>
                      setEditingModule({
                        id: mod.id,
                        title: mod.title[locale],
                        description: mod.description?.[locale] ?? '',
                      })
                    }
                  >
                    <Edit3 size={13} aria-hidden="true" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    aria-label={t('instructor.selfService.curriculum.deleteModule')}
                    onClick={() => setConfirmDelete({ type: 'module', moduleId: mod.id })}
                  >
                    <Trash2 size={13} aria-hidden="true" />
                  </Button>
                  <Button
                    size="sm"
                    variant="tertiary"
                    aria-label={
                      isCollapsed
                        ? t('instructor.selfService.curriculum.expand')
                        : t('instructor.selfService.curriculum.collapse')
                    }
                    onClick={() =>
                      setCollapsedModules((prev) => ({ ...prev, [mod.id]: !prev[mod.id] }))
                    }
                  >
                    {isCollapsed ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
                  </Button>
                </div>
              </div>

              {!isCollapsed ? (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {mod.lessons.map((lesson, idx) => (
                      <div
                        key={lesson.id}
                        draggable
                        onDragStart={(e) => {
                          e.stopPropagation();
                          setDraggedLesson({ moduleId: mod.id, idx });
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onDrop={(e) => {
                          e.stopPropagation();
                          if (
                            draggedLesson &&
                            draggedLesson.moduleId === mod.id &&
                            draggedLesson.idx !== idx
                          ) {
                            reorderLessons(course.slug, mod.id, draggedLesson.idx, idx);
                          }
                          setDraggedLesson(null);
                        }}
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 10,
                          padding: 12,
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border)',
                          background: 'var(--surface-subtle)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 200 }}>
                          <GripVertical size={15} style={{ color: 'var(--text-secondary)', cursor: 'grab' }} aria-hidden="true" />
                          <Badge variant="neutral">{idx + 1}</Badge>
                          <div>
                            <div className="text-small" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                              {lesson.title[locale]}
                            </div>
                            <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                              {t(`instructor.selfService.curriculum.lessonTypes.${lesson.lessonType ?? 'video'}`)} ·{' '}
                              {t('common.minutesShort', { count: lesson.durationMinutes })}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          {lesson.pendingRevision ? (
                            <Badge variant={lesson.pendingRevision.status === 'rejected' ? 'error' : 'brand'}>
                              {lesson.pendingRevision.status === 'pending_approval'
                                ? t('instructor.selfService.curriculum.pendingRevisionBadge')
                                : lesson.pendingRevision.status === 'rejected'
                                  ? t('instructor.selfService.curriculum.rejectedRevisionBadge')
                                  : t('instructor.selfService.curriculum.draftRevisionBadge')}
                            </Badge>
                          ) : null}
                          <LessonStatusBadge status={lesson.status} />

                          {course.modules.length > 1 ? (
                            <select
                              aria-label={t('instructor.selfService.curriculum.moveToModule')}
                              className="ui-field__control"
                              style={{ width: 'auto', paddingBlock: 4, fontSize: '0.78rem' }}
                              value=""
                              onChange={(e) => {
                                if (e.target.value) {
                                  moveLessonToModule(course.slug, mod.id, e.target.value, lesson.id);
                                }
                              }}
                            >
                              <option value="">{t('instructor.selfService.curriculum.moveToModule')}</option>
                              {course.modules
                                .filter((m) => m.id !== mod.id)
                                .map((targetMod) => (
                                  <option key={targetMod.id} value={targetMod.id}>
                                    {targetMod.title[locale]}
                                  </option>
                                ))}
                            </select>
                          ) : null}

                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={idx === 0}
                            aria-label={t('instructor.lessons.moveUp')}
                            onClick={() => moveLesson(course.slug, mod.id, lesson.id, 'up')}
                          >
                            <ArrowUp size={13} aria-hidden="true" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={idx === mod.lessons.length - 1}
                            aria-label={t('instructor.lessons.moveDown')}
                            onClick={() => moveLesson(course.slug, mod.id, lesson.id, 'down')}
                          >
                            <ArrowDown size={13} aria-hidden="true" />
                          </Button>
                          <Button
                            variant="tertiary"
                            size="sm"
                            aria-label={t('instructor.selfService.curriculum.duplicateLesson')}
                            onClick={() => duplicateLesson(course.slug, mod.id, lesson.id)}
                          >
                            <Copy size={13} aria-hidden="true" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            aria-label={t('instructor.selfService.curriculum.deleteLesson')}
                            onClick={() =>
                              setConfirmDelete({ type: 'lesson', moduleId: mod.id, lessonId: lesson.id })
                            }
                          >
                            <Trash2 size={13} aria-hidden="true" />
                          </Button>
                          <Link
                            to={`/instructor/courses/${course.slug}/lessons/${lesson.id}`}
                            className="ui-btn ui-btn--primary ui-btn--sm"
                          >
                            <Edit3 size={14} aria-hidden="true" /> {t('instructor.lessons.editLesson')}
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Lesson inside Module */}
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      const title = lessonDrafts[mod.id] ?? '';
                      if (!title.trim()) return;
                      addLesson(course.slug, mod.id, title, lessonTypes[mod.id] ?? 'video');
                      setLessonDrafts((prev) => ({ ...prev, [mod.id]: '' }));
                    }}
                    style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}
                  >
                    <input
                      type="text"
                      className="ui-field__control"
                      style={{ flex: '1 1 200px' }}
                      value={lessonDrafts[mod.id] ?? ''}
                      onChange={(e) =>
                        setLessonDrafts((prev) => ({ ...prev, [mod.id]: e.target.value }))
                      }
                      placeholder={t('instructor.lessons.addLessonPlaceholder')}
                      aria-label={t('instructor.lessons.addLessonPlaceholder')}
                    />
                    <div style={{ flex: '0 1 170px' }}>
                      <Select
                        aria-label={t('instructor.selfService.curriculum.lessonType')}
                        value={lessonTypes[mod.id] ?? 'video'}
                        onChange={(e) =>
                          setLessonTypes((prev) => ({
                            ...prev,
                            [mod.id]: e.target.value as LessonType,
                          }))
                        }
                      >
                        <option value="video">{t('instructor.selfService.curriculum.lessonTypes.video')}</option>
                        <option value="reading">{t('instructor.selfService.curriculum.lessonTypes.reading')}</option>
                        <option value="practice">{t('instructor.selfService.curriculum.lessonTypes.practice')}</option>
                        <option value="mixed">{t('instructor.selfService.curriculum.lessonTypes.mixed')}</option>
                      </Select>
                    </div>
                    <Button type="submit" variant="secondary" size="sm">
                      <Plus size={14} aria-hidden="true" /> {t('instructor.lessons.addLessonBtn')}
                    </Button>
                  </form>
                </>
              ) : null}
            </Card>
          </div>
        );
      })}

      {/* Edit Module Modal */}
      <Modal
        isOpen={Boolean(editingModule)}
        onClose={() => setEditingModule(null)}
        title={t('instructor.selfService.curriculum.editModule')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditingModule(null)}>
              {t('admin.common.cancel')}
            </Button>
            <Button variant="primary" onClick={handleSaveModuleEdit}>
              {t('admin.common.save')}
            </Button>
          </>
        }
      >
        {editingModule ? (
          <div className="details-stack" style={{ gap: 12 }}>
            <Input
              label={t('instructor.lessons.addModuleTitle')}
              value={editingModule.title}
              onChange={(e) => setEditingModule({ ...editingModule, title: e.target.value })}
            />
            <Input
              label={t('instructor.selfService.curriculum.addModuleDescPlaceholder')}
              value={editingModule.description}
              onChange={(e) => setEditingModule({ ...editingModule, description: e.target.value })}
            />
          </div>
        ) : null}
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal
        isOpen={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        title={
          confirmDelete?.type === 'module'
            ? t('instructor.selfService.curriculum.confirmDeleteModuleTitle')
            : t('instructor.selfService.curriculum.confirmDeleteLessonTitle')
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmDelete(null)}>
              {t('admin.common.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              {t('admin.common.delete')}
            </Button>
          </>
        }
      >
        <p className="text-body">
          {confirmDelete?.type === 'module'
            ? t('instructor.selfService.curriculum.confirmDeleteModuleBody')
            : t('instructor.selfService.curriculum.confirmDeleteLessonBody')}
        </p>
      </Modal>
    </div>
  );
}
