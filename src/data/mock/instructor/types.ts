import type { BilingualText, CourseLevel, CourseResource } from '../types';

export type VideoProviderType =
  | 'youtube_unlisted'
  | 'cloudflare_stream'
  | 'vimeo'
  | 'custom_hls';

export type PublishStatus = 'draft' | 'published';

export interface InstructorProfileState {
  slug: string;
  fullName: BilingualText;
  title: BilingualText;
  initials: string;
  email: string;
  biography: BilingualText;
  expertise: BilingualText[];
  experience: Array<{
    role: BilingualText;
    organization: BilingualText;
    period: BilingualText;
  }>;
  education: Array<{
    degree: BilingualText;
    institution: BilingualText;
    year: string;
  }>;
  website?: string;
}

export interface ManagedLesson {
  id: string;
  title: BilingualText;
  description: BilingualText;
  durationMinutes: number;
  videoProvider: VideoProviderType;
  videoSourceId: string;
  materialsNote: BilingualText;
  resources: CourseResource[];
  isPreview: boolean;
  status: PublishStatus;
}

export interface ManagedModule {
  id: string;
  title: BilingualText;
  lessons: ManagedLesson[];
}

export interface ManagedCourseState {
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
  status: PublishStatus;
  lastUpdated: BilingualText;
  objectives: BilingualText[];
  requirements: BilingualText[];
  targetAudience: BilingualText[];
  modules: ManagedModule[];
  resources: CourseResource[];
}

export interface AssignedStudentCourseProgress {
  courseSlug: string;
  completedLessons: number;
  totalLessons: number;
  percent: number;
  status: 'active' | 'completed';
  lastActivity: BilingualText;
}

export interface AssignedStudentRecord {
  id: string;
  fullName: BilingualText;
  initials: string;
  email: string;
  conversationId?: string;
  enrollments: AssignedStudentCourseProgress[];
}

export interface ModerationReplyItem {
  id: string;
  authorName: BilingualText;
  authorRole: 'student' | 'instructor';
  initials: string;
  content: BilingualText;
  timeLabel: BilingualText;
}

export interface ModerationPostItem {
  id: string;
  courseSlug: string;
  authorName: BilingualText;
  authorRole: 'student' | 'instructor';
  initials: string;
  title?: BilingualText;
  content: BilingualText;
  timeLabel: BilingualText;
  isPinned: boolean;
  isHidden: boolean;
  isAnnouncement: boolean;
  replies: ModerationReplyItem[];
}

export interface InstructorAnnouncementRecord {
  id: string;
  courseSlug: string;
  title: BilingualText;
  body: BilingualText;
  status: PublishStatus;
  createdAt: BilingualText;
}

export interface InstructorMessageItem {
  id: string;
  sender: 'student' | 'instructor';
  content: BilingualText;
  timeLabel: BilingualText;
}

export interface InstructorConversationItem {
  id: string;
  studentId: string;
  courseSlug: string;
  unreadCount: number;
  messages: InstructorMessageItem[];
}

export interface InstructorNotificationPreferences {
  newStudentMessages: boolean;
  communityQuestions: boolean;
  courseMilestones: boolean;
  weeklySummary: boolean;
}
