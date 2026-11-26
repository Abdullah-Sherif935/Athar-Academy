import type { WeeklyActivityPoint } from '../student/types';

export const INSTRUCTOR_WEEKLY_ACTIVITY: WeeklyActivityPoint[] = [
  { id: 'sat', day: { ar: 'السبت', en: 'Sat' }, minutes: 140, lessons: 4 },
  { id: 'sun', day: { ar: 'الأحد', en: 'Sun' }, minutes: 210, lessons: 6 },
  { id: 'mon', day: { ar: 'الاثنين', en: 'Mon' }, minutes: 185, lessons: 5 },
  { id: 'tue', day: { ar: 'الثلاثاء', en: 'Tue' }, minutes: 260, lessons: 8 },
  { id: 'wed', day: { ar: 'الأربعاء', en: 'Wed' }, minutes: 195, lessons: 6 },
  { id: 'thu', day: { ar: 'الخميس', en: 'Thu' }, minutes: 160, lessons: 4 },
  { id: 'fri', day: { ar: 'الجمعة', en: 'Fri' }, minutes: 90, lessons: 2 },
];
