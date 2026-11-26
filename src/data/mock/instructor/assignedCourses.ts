import { MOCK_COURSES } from '../index';
import { DEMO_INSTRUCTOR_SLUG } from './instructorProfile';
import type { ManagedCourseState, ManagedLesson, ManagedModule } from './types';

function buildManagedCourses(): ManagedCourseState[] {
  return MOCK_COURSES.filter((course) =>
    course.instructorSlugs.includes(DEMO_INSTRUCTOR_SLUG),
  ).map((course) => {
    const isRobotics = course.slug === 'robotics-control-prototyping';

    const modules: ManagedModule[] = course.curriculum.map((mod, modIdx) => {
      const lessons: ManagedLesson[] = mod.lessons.map((lesson, lessonIdx) => ({
        id: lesson.id,
        title: lesson.title,
        description: {
          ar: `وصف تجريبي للدرس "${lesson.title.ar}" ضمن وحدة ${mod.title.ar}.`,
          en: `Demo lesson description for "${lesson.title.en}" inside ${mod.title.en}.`,
        },
        durationMinutes: lesson.durationMinutes,
        videoProvider: 'youtube_unlisted',
        videoSourceId: `demo-video-${course.code.toLowerCase()}-${lesson.id}`,
        materialsNote: {
          ar: 'ملخص الدرس وأمثلة تطبيقية (محتوى محلي تجريبي).',
          en: 'Lesson summary and practical takeaways (local demo placeholder).',
        },
        resources: modIdx === 0 && lessonIdx === 0 ? course.resources : [],
        isPreview: Boolean(lesson.isPreview),
        status: isRobotics ? 'draft' : 'published',
      }));

      // Add one realistic draft lesson to the last module of published courses
      if (!isRobotics && modIdx === course.curriculum.length - 1) {
        lessons.push({
          id: `${lessonIdPrefix(course.slug)}-draft`,
          title: {
            ar: 'مسودة درس: تطبيق عملي ومراجعة شاملة',
            en: 'Draft Lesson: Practical Lab & Comprehensive Review',
          },
          description: {
            ar: 'مسودة درس تجريبية قيد الإعداد ولا تظهر كدرس منشور حتى نشرها محليًا.',
            en: 'Sample draft lesson in preparation—not counted as published until published locally.',
          },
          durationMinutes: 25,
          videoProvider: 'youtube_unlisted',
          videoSourceId: `demo-draft-${course.code.toLowerCase()}`,
          materialsNote: {
            ar: 'ورقة تمرين قيد المراجعة (مسودة).',
            en: 'Exercise sheet under review (draft).',
          },
          resources: [],
          isPreview: false,
          status: 'draft',
        });
      }

      return { id: mod.id, title: mod.title, lessons };
    });

    return {
      slug: course.slug,
      code: course.code,
      title: course.title,
      shortDescription: course.shortDescription,
      fullDescription: course.fullDescription,
      disciplineSlug: course.disciplineSlug,
      instructorSlugs: course.instructorSlugs,
      level: course.level,
      duration: course.duration,
      accent: course.accent,
      status: isRobotics ? 'draft' : 'published',
      lastUpdated: isRobotics
        ? { ar: 'منذ 5 أيام (مسودة)', en: '5 days ago (Draft)' }
        : { ar: 'منذ يومين (نموذجي)', en: '2 days ago (Demo)' },
      objectives: course.objectives,
      requirements: course.requirements,
      targetAudience: course.targetAudience,
      modules,
      resources: course.resources,
    };
  });
}

function lessonIdPrefix(slug: string): string {
  return slug.slice(0, 6);
}

export const INITIAL_ASSIGNED_COURSES: ManagedCourseState[] = buildManagedCourses();
