import type { FaqItem } from './types';

export const MOCK_FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    question: {
      ar: 'هل تقتصر أكاديمية أثر على مجال البرمجة والهندسة فقط؟',
      en: 'Is ATHAR ACADEMY limited to engineering and technology?',
    },
    answer: {
      ar: 'لا، أكاديمية أثر منصة تعليمية متعددة التخصصات تشمل الهندسة والتقنية والأعمال والتصميم والإعلام والتطوير الشخصي والعلوم والتعليم.',
      en: 'No. ATHAR ACADEMY is a multi-disciplinary platform spanning engineering, technology, business, design, digital media, personal development, and education.',
    },
  },
  {
    id: 'faq-2',
    question: {
      ar: 'كيف تعمل آلية الالتحاق بالدورات في المنصة؟',
      en: 'How does course enrollment work on the platform?',
    },
    answer: {
      ar: 'يستطيع المتعلم تصفح الدورات المتاحة وتقديم طلب التحاق، وتتم مراجعة الطلب واعتماده من إدارة المنصة قبل إتاحة محتوى الدورة ومجتمعها. في المرحلة الحالية (02A) هذه العملية معروضة كواجهة تجريبية فقط.',
      en: 'Learners browse courses and submit an enrollment request, which is reviewed and approved by the platform administration before granting access to lessons and the course community. In Phase 02A, this flow is shown as a frontend demo only.',
    },
  },
  {
    id: 'faq-3',
    question: {
      ar: 'هل المنصة متاحة باللغتين العربية والإنجليزية؟',
      en: 'Is the platform available in both Arabic and English?',
    },
    answer: {
      ar: 'نعم، يدعم الموقع بالكامل اللغتين العربية (RTL) والإنجليزية (LTR) مع إمكانية التبديل الفوري بينهما وحفظ التفضيل تلقائيًا.',
      en: 'Yes. Every public page supports full Arabic (RTL) and English (LTR) layouts with instant switching and saved user preference.',
    },
  },
  {
    id: 'faq-4',
    question: {
      ar: 'هل الدورات والمدربون المعروضون حاليًا بيانات حقيقية؟',
      en: 'Are the courses and instructors currently shown live data?',
    },
    answer: {
      ar: 'البيانات المعروضة حاليًا هي بيانات تجريبية منظمة (Demo Mock Data) لاختبار واجهات الموقع وتجربة المستخدم قبل ربط قاعدة البيانات في المراحل القادمة.',
      en: 'Currently displayed courses, instructors, and feedback are structured demo mock data used to validate the public website experience before connecting the backend in upcoming phases.',
    },
  },
];
