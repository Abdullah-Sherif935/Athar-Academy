import { getInstructorBySlug } from '../index';
import type { InstructorNotificationPreferences, InstructorProfileState } from './types';

export const DEMO_INSTRUCTOR_SLUG = 'dr-tariq-al-mansour';

const baseInstructor = getInstructorBySlug(DEMO_INSTRUCTOR_SLUG);

export const INITIAL_INSTRUCTOR_PROFILE: InstructorProfileState = {
  slug: DEMO_INSTRUCTOR_SLUG,
  fullName: baseInstructor?.name ?? {
    ar: 'د. طارق المنصور (نموذج)',
    en: 'Dr. Tariq Al-Mansour (Demo)',
  },
  title: baseInstructor?.title ?? {
    ar: 'مدرب هندسة النظم وتطوير البرمجيات',
    en: 'Systems Engineering & Software Architecture Instructor',
  },
  initials: baseInstructor?.initials ?? 'TM',
  email: 'tariq.demo@atharacademy.example',
  biography: baseInstructor?.biography ?? {
    ar: 'ملف مدرب تجريبي في أكاديمية أثر.',
    en: 'Demo instructor profile on ATHAR ACADEMY.',
  },
  expertise: baseInstructor?.expertise ?? [],
  experience: baseInstructor?.experience ?? [],
  education: [
    {
      degree: {
        ar: 'دكتوراه في هندسة النظم (بيانات نموذجية)',
        en: 'Ph.D. in Systems Engineering (Sample Data)',
      },
      institution: {
        ar: 'جامعة تقنية نموذجية',
        en: 'Sample Institute of Technology',
      },
      year: '2016',
    },
  ],
  website: baseInstructor?.socialLinks?.website,
};

export const INITIAL_INSTRUCTOR_PREFS: InstructorNotificationPreferences = {
  newStudentMessages: true,
  communityQuestions: true,
  courseMilestones: true,
  weeklySummary: false,
};
