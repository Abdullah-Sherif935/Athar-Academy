import type { EnrollmentRequestRecord } from './types';

export const INITIAL_ENROLLMENT_REQUESTS: EnrollmentRequestRecord[] = [
  {
    id: 'req-demo-eng-201',
    studentId: 'stu-sara',
    courseSlug: 'systems-engineering-fundamentals',
    leadInstructorSlug: 'dr-tariq-al-mansour',
    status: 'pending',
    paymentStatus: 'unpaid',
    priceSnapshot: 1500,
    currency: 'EGP',
    isFreeSnapshot: false,
    studentMessage: 'Looking forward to joining this cohort!',
    requestedAt: {
      ar: '25 نوفمبر 2026 (بيانات تجريبية)',
      en: 'Nov 25, 2026 (Demo Data)',
    },
    updatedAt: {
      ar: '25 نوفمبر 2026',
      en: 'Nov 25, 2026',
    },
  },
  {
    id: 'req-demo-rob-210',
    studentId: 'stu-sara',
    courseSlug: 'robotics-control-prototyping',
    leadInstructorSlug: 'dr-tariq-al-mansour',
    status: 'rejected',
    paymentStatus: 'unpaid',
    priceSnapshot: 1800,
    currency: 'EGP',
    isFreeSnapshot: false,
    requestedAt: {
      ar: '22 نوفمبر 2026 (بيانات تجريبية)',
      en: 'Nov 22, 2026 (Demo Data)',
    },
    updatedAt: {
      ar: '23 نوفمبر 2026',
      en: 'Nov 23, 2026',
    },
    reviewNote: {
      ar: 'مثال توضيحي: لم تكتمل المتطلبات التمهيدية بعد. يمكنك إعادة تقديم الطلب عند الاستعداد.',
      en: 'Sample note: Introductory prerequisites were not yet met. You may submit a new request when ready.',
    },
  },
  {
    id: 'req-demo-dev-101',
    studentId: 'stu-sara',
    courseSlug: 'foundations-modern-web-development',
    leadInstructorSlug: 'dr-tariq-al-mansour',
    status: 'active',
    paymentStatus: 'confirmed',
    priceSnapshot: 1500,
    currency: 'EGP',
    isFreeSnapshot: false,
    requestedAt: {
      ar: '18 نوفمبر 2026 (بيانات تجريبية)',
      en: 'Nov 18, 2026 (Demo Data)',
    },
    updatedAt: {
      ar: '19 نوفمبر 2026',
      en: 'Nov 19, 2026',
    },
    paymentConfirmation: {
      instructorSlug: 'dr-tariq-al-mansour',
      instructorName: { ar: 'د. طارق المنصور (نموذج)', en: 'Dr. Tariq Al-Mansour (Demo)' },
      confirmedAt: { ar: '19 نوفمبر 2026', en: 'Nov 19, 2026' },
      amount: 1500,
      currency: 'EGP',
      declarationAccepted: true,
    },
    reviewNote: {
      ar: 'تم تأكيد استلام الرسوم مباشرة من المدرب وتفعيل الوصول للدورة.',
      en: 'Direct payment confirmed by instructor — course access is active.',
    },
  },
];
