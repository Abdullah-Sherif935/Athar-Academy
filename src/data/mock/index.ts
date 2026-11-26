import { MOCK_COURSES } from './courses';
import { MOCK_DISCIPLINES } from './disciplines';
import { MOCK_FAQS } from './faq';
import { MOCK_INSTRUCTORS } from './instructors';
import { MOCK_TESTIMONIALS } from './testimonials';
import type { Course, Discipline, Instructor } from './types';

export * from './types';
export { MOCK_COURSES, MOCK_DISCIPLINES, MOCK_FAQS, MOCK_INSTRUCTORS, MOCK_TESTIMONIALS };

export function getDisciplineBySlug(slug: string): Discipline | undefined {
  return MOCK_DISCIPLINES.find((item) => item.slug === slug);
}

export function getCourseBySlug(slug: string): Course | undefined {
  return MOCK_COURSES.find((item) => item.slug === slug);
}

export function getInstructorBySlug(slug: string): Instructor | undefined {
  return MOCK_INSTRUCTORS.find((item) => item.slug === slug);
}

export function getCoursesByDiscipline(disciplineSlug: string): Course[] {
  return MOCK_COURSES.filter((course) => course.disciplineSlug === disciplineSlug);
}

export function getCoursesByInstructor(instructorSlug: string): Course[] {
  return MOCK_COURSES.filter((course) => course.instructorSlugs.includes(instructorSlug));
}

export function getInstructorsForCourse(course: Course): Instructor[] {
  return course.instructorSlugs
    .map((slug) => getInstructorBySlug(slug))
    .filter((item): item is Instructor => Boolean(item));
}

export function getInstructorsByDiscipline(disciplineSlug: string): Instructor[] {
  return MOCK_INSTRUCTORS.filter((inst) => inst.disciplineSlugs.includes(disciplineSlug));
}

export function getRelatedCourses(course: Course, limit = 3): Course[] {
  const sameDiscipline = MOCK_COURSES.filter(
    (item) => item.slug !== course.slug && item.disciplineSlug === course.disciplineSlug,
  );
  const others = MOCK_COURSES.filter(
    (item) => item.slug !== course.slug && item.disciplineSlug !== course.disciplineSlug,
  );
  return [...sameDiscipline, ...others].slice(0, limit);
}
