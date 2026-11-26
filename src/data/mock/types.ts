export interface BilingualText {
  ar: string;
  en: string;
}

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Discipline {
  slug: string;
  name: BilingualText;
  shortDescription: BilingualText;
  overview: BilingualText;
  highlights: BilingualText[];
  iconName:
    | 'cpu'
    | 'code'
    | 'bot'
    | 'briefcase'
    | 'palette'
    | 'megaphone'
    | 'compass'
    | 'flask';
  accent: 'blue' | 'teal' | 'orange' | 'navy';
  featured?: boolean;
}

export interface InstructorSocialLinks {
  linkedin?: string;
  website?: string;
}

export interface Instructor {
  slug: string;
  name: BilingualText;
  title: BilingualText;
  initials: string;
  accent: 'blue' | 'teal' | 'orange' | 'navy';
  shortBio: BilingualText;
  biography: BilingualText;
  expertise: BilingualText[];
  experience: Array<{
    role: BilingualText;
    organization: BilingualText;
    period: BilingualText;
  }>;
  disciplineSlugs: string[];
  socialLinks?: InstructorSocialLinks;
  featured?: boolean;
}

export interface CourseModule {
  id: string;
  title: BilingualText;
  lessons: Array<{
    id: string;
    title: BilingualText;
    durationMinutes: number;
    isPreview?: boolean;
  }>;
}

export interface CourseResource {
  id: string;
  title: BilingualText;
  type: 'pdf' | 'template' | 'worksheet' | 'guide';
}

export interface Course {
  slug: string;
  code: string;
  title: BilingualText;
  shortDescription: BilingualText;
  fullDescription: BilingualText;
  disciplineSlug: string;
  instructorSlugs: string[];
  level: CourseLevel;
  duration: BilingualText;
  accent: 'blue' | 'teal' | 'orange' | 'navy';
  featured?: boolean;
  priceLabel?: BilingualText;
  whatYouWillLearn: BilingualText[];
  objectives: BilingualText[];
  requirements: BilingualText[];
  targetAudience: BilingualText[];
  curriculum: CourseModule[];
  resources: CourseResource[];
}

export interface DemoTestimonial {
  id: string;
  authorName: BilingualText;
  role: BilingualText;
  quote: BilingualText;
  disciplineSlug: string;
}

export interface FaqItem {
  id: string;
  question: BilingualText;
  answer: BilingualText;
}
