import type { DemoTestimonial } from './types';

export const MOCK_TESTIMONIALS: DemoTestimonial[] = [
  {
    id: 'demo-t1',
    authorName: { ar: 'متعلم نموذجي — مسار التقنية', en: 'Sample Learner — Technology Track' },
    role: { ar: 'مثال توضيحي لتجربة المتعلم', en: 'Illustrative Learner Feedback (Demo)' },
    quote: {
      ar: 'مثال توضيحي: وضوح الواجهة العربية والوضع الداكن يجعلان متابعة الدروس والموارد مريحة جدًا في جلسات الدراسة الطويلة.',
      en: 'Demo example: Clean typography, bilingual clarity, and dark mode make studying lessons and resources comfortable over long sessions.',
    },
    disciplineSlug: 'programming-software',
  },
  {
    id: 'demo-t2',
    authorName: { ar: 'متعلمة نموذجية — مسار التصميم', en: 'Sample Learner — Design Track' },
    role: { ar: 'مثال توضيحي لتجربة المتعلم', en: 'Illustrative Learner Feedback (Demo)' },
    quote: {
      ar: 'مثال توضيحي: وجود مجتمع خاص لكل دورة وإشراف مباشر من المدرب يحول التعلم الذاتي إلى تجربة تفاعلية حقيقية.',
      en: 'Demo example: Having a dedicated course community with direct instructor guidance turns self-paced study into an engaging journey.',
    },
    disciplineSlug: 'design-creative-arts',
  },
  {
    id: 'demo-t3',
    authorName: { ar: 'متعلم نموذجي — مسار الأعمال', en: 'Sample Learner — Business Track' },
    role: { ar: 'مثال توضيحي لتجربة المتعلم', en: 'Illustrative Learner Feedback (Demo)' },
    quote: {
      ar: 'مثال توضيحي: تعدد التخصصات داخل منصة واحدة منظمة يسهّل بناء مهارات متكاملة بين الإدارة والتقنية والتواصل.',
      en: 'Demo example: Exploring multiple disciplines inside one cohesive platform makes it easy to combine leadership, technology, and communication skills.',
    },
    disciplineSlug: 'business-entrepreneurship',
  },
];
