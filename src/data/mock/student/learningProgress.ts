import type { WeeklyActivityPoint } from './types';

export const MOCK_WEEKLY_ACTIVITY: WeeklyActivityPoint[] = [
  { id: 'sat', day: { ar: 'السبت', en: 'Sat' }, minutes: 35, lessons: 1 },
  { id: 'sun', day: { ar: 'الأحد', en: 'Sun' }, minutes: 50, lessons: 2 },
  { id: 'mon', day: { ar: 'الاثنين', en: 'Mon' }, minutes: 20, lessons: 1 },
  { id: 'tue', day: { ar: 'الثلاثاء', en: 'Tue' }, minutes: 65, lessons: 2 },
  { id: 'wed', day: { ar: 'الأربعاء', en: 'Wed' }, minutes: 40, lessons: 1 },
  { id: 'thu', day: { ar: 'الخميس', en: 'Thu' }, minutes: 30, lessons: 1 },
  { id: 'fri', day: { ar: 'الجمعة', en: 'Fri' }, minutes: 15, lessons: 0 },
];
