import type { BilingualText } from '../types';

export interface DemoStudentProfile {
  fullName: BilingualText;
  email: string;
  initials: string;
  bio: BilingualText;
  interests: BilingualText[];
  memberSince: BilingualText;
}

export interface EnrolledCourseRecord {
  courseSlug: string;
  completedLessonIds: string[];
  lastAccessedLabel: BilingualText;
  lastLessonId: string;
  isSuspended?: boolean;
  upcomingActivity?: {
    title: BilingualText;
    dueLabel: BilingualText;
  };
}

export interface WeeklyActivityPoint {
  id: string;
  day: BilingualText;
  minutes: number;
  lessons: number;
}

export type NotificationKind = 'lesson' | 'announcement' | 'reply' | 'message' | 'update';

export interface StudentNotification {
  id: string;
  kind: NotificationKind;
  title: BilingualText;
  body: BilingualText;
  timeLabel: BilingualText;
  isRead: boolean;
  targetPath: string;
}

export interface CommunityReplyItem {
  id: string;
  authorName: BilingualText;
  authorRole: 'student' | 'instructor';
  initials: string;
  content: BilingualText;
  timeLabel: BilingualText;
}

export interface CommunityPostItem {
  id: string;
  courseSlug: string;
  authorName: BilingualText;
  authorRole: 'student' | 'instructor';
  initials: string;
  isPinned?: boolean;
  isAnnouncement?: boolean;
  title?: BilingualText;
  content: BilingualText;
  timeLabel: BilingualText;
  likes: number;
  likedByMe?: boolean;
  replies: CommunityReplyItem[];
}

export interface DirectMessageItem {
  id: string;
  sender: 'student' | 'instructor';
  content: BilingualText;
  timeLabel: BilingualText;
}

export interface ConversationItem {
  id: string;
  instructorSlug: string;
  courseSlug: string;
  unreadCount: number;
  messages: DirectMessageItem[];
}

export interface StudentCertificate {
  id: string;
  courseSlug: string;
  certificateCode: string;
  issuedLabel: BilingualText;
}

export interface StudentNotificationPreferences {
  newLessons: boolean;
  instructorAnnouncements: boolean;
  communityReplies: boolean;
  directMessages: boolean;
  weeklySummary: boolean;
}

export type PaymentStatus =
  | 'not_required'
  | 'unpaid'
  | 'awaiting_payment'
  | 'confirmed'
  | 'refunded_record';

export type EnrollmentRequestStatus =
  | 'pending'
  | 'awaiting_payment'
  | 'payment_confirmed'
  | 'active'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'suspended'
  | 'refunded';

export type CourseAvailabilityState =
  | 'available'
  | 'pending'
  | 'awaiting_payment'
  | 'enrolled'
  | 'rejected'
  | 'cancelled'
  | 'suspended';

export interface PaymentConfirmationDeclaration {
  instructorSlug: string;
  instructorName: BilingualText;
  confirmedAt: BilingualText;
  amount: number;
  currency: string;
  declarationAccepted: true;
}

export interface EnrollmentRequestRecord {
  id: string;
  studentId: string;
  courseSlug: string;
  leadInstructorSlug: string;
  status: EnrollmentRequestStatus;
  paymentStatus: PaymentStatus;
  requestedAt: BilingualText;
  updatedAt: BilingualText;
  priceSnapshot: number;
  currency: 'EGP' | 'USD' | 'SAR';
  isFreeSnapshot: boolean;
  studentMessage?: string;
  reviewNote?: BilingualText;
  paymentConfirmation?: PaymentConfirmationDeclaration;
  adminOverride?: {
    reason: string;
    timestamp: BilingualText;
    previousStatus: EnrollmentRequestStatus;
  };
}
