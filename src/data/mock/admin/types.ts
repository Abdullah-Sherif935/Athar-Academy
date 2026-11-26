import type { BilingualText, CourseLevel, CourseResource } from '../types';
import type { VideoProviderType } from '../instructor/types';

export type AdminCourseStatus = 'draft' | 'published' | 'archived';
export type AdminLessonStatus = 'draft' | 'pending_approval' | 'published' | 'rejected';
export type StudentAccountStatus = 'active' | 'inactive' | 'suspended';
export type InstructorAccountStatus = 'active' | 'inactive' | 'revoked';
export type ReviewStatus = 'pending' | 'approved' | 'hidden';
export type LessonType = 'video' | 'reading' | 'practice' | 'mixed';
export type LessonResourceType = 'pdf' | 'document' | 'presentation' | 'spreadsheet' | 'link';
export type ProposalStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected';
export type CourseLanguage = 'ar' | 'en' | 'bilingual';
export type PaymentMethodType =
  | 'vodafone_cash'
  | 'instapay'
  | 'bank_transfer'
  | 'cash_in_person'
  | 'other';
export type CourseCurrency = 'EGP' | 'USD' | 'SAR';

export interface CoursePricingConfig {
  isFree: boolean;
  priceAmount: number;
  currency: CourseCurrency;
  paymentMethods: PaymentMethodType[];
  paymentInstructions: BilingualText;
  enrollmentOpen: boolean;
  maxCapacity?: number;
  enrollmentStartDate?: string;
  enrollmentEndDate?: string;
}

export type EnrollmentAuditEventType =
  | 'request_created'
  | 'instructor_accepted'
  | 'instructor_rejected'
  | 'payment_confirmed'
  | 'enrollment_activated'
  | 'admin_suspended'
  | 'admin_reactivated'
  | 'enrollment_cancelled'
  | 'admin_override'
  | 'dispute_submitted'
  | 'dispute_resolved';

export interface EnrollmentAuditEvent {
  id: string;
  enrollmentId: string;
  eventType: EnrollmentAuditEventType;
  actorId: string;
  actorRole: 'student' | 'instructor' | 'admin';
  timestamp: BilingualText;
  previousStatus?: string;
  newStatus: string;
  reason?: string;
}

export type DisputeCategory =
  | 'access_not_granted'
  | 'instructor_no_response'
  | 'course_mismatch'
  | 'other';

export interface EnrollmentDispute {
  id: string;
  enrollmentId: string;
  studentId: string;
  courseSlug: string;
  leadInstructorSlug: string;
  category: DisputeCategory;
  description: string;
  status: 'open' | 'in_review' | 'resolved';
  createdAt: BilingualText;
  resolutionNote?: string;
  refundConfirmedByParties?: boolean;
  resolvedAt?: BilingualText;
}

export interface LessonResourceItem {
  id: string;
  title: BilingualText;
  description: BilingualText;
  type: LessonResourceType;
  fileNameOrUrl: string;
  status: 'attached_demo';
}

export interface LessonRevisionDraft {
  title: BilingualText;
  shortDescription: BilingualText;
  description: BilingualText;
  durationMinutes: number;
  lessonType: LessonType;
  videoProvider: VideoProviderType;
  videoUrl?: string;
  videoSourceId: string;
  materialsNote: BilingualText;
  lessonResources: LessonResourceItem[];
  isPreview: boolean;
  status: 'draft' | 'pending_approval' | 'rejected';
  rejectionReason?: BilingualText;
  updatedAt: BilingualText;
}

export interface CourseProposal {
  id: string;
  proposingInstructorSlug: string;
  title: BilingualText;
  shortDescription: BilingualText;
  fullDescription: BilingualText;
  disciplineSlug: string;
  level: CourseLevel;
  thumbnailUrl?: string;
  whatYouWillLearn: BilingualText[];
  requirements: BilingualText[];
  targetAudience: BilingualText[];
  duration: BilingualText;
  suggestedPrice: BilingualText;
  enrollmentNotes: BilingualText;
  language: CourseLanguage;
  status: ProposalStatus;
  rejectionReason?: BilingualText;
  createdAt: BilingualText;
  updatedAt: BilingualText;
  approvedCourseSlug?: string;
}

export interface PlatformDiscipline {
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
  isActive: boolean;
}

export interface PlatformInstructor {
  slug: string;
  name: BilingualText;
  title: BilingualText;
  initials: string;
  email: string;
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
  socialLinks?: { linkedin?: string; website?: string };
  featured?: boolean;
  status: InstructorAccountStatus;
  joinedDate: BilingualText;
}

export interface PlatformLesson {
  id: string;
  title: BilingualText;
  shortDescription?: BilingualText;
  description: BilingualText;
  durationMinutes: number;
  lessonType?: LessonType;
  videoProvider: VideoProviderType;
  videoUrl?: string;
  videoSourceId: string;
  materialsNote: BilingualText;
  resources: CourseResource[];
  lessonResources?: LessonResourceItem[];
  isPreview: boolean;
  status: AdminLessonStatus;
  rejectionReason?: BilingualText;
  pendingRevision?: LessonRevisionDraft;
}

export interface PlatformModule {
  id: string;
  title: BilingualText;
  description?: BilingualText;
  lessons: PlatformLesson[];
}

export interface PlatformCourse {
  slug: string;
  code: string;
  title: BilingualText;
  shortDescription: BilingualText;
  fullDescription: BilingualText;
  disciplineSlug: string;
  instructorSlugs: string[];
  leadInstructorSlug?: string;
  enrollmentManagerSlugs?: string[];
  pricing: CoursePricingConfig;
  level: CourseLevel;
  duration: BilingualText;
  language?: CourseLanguage;
  thumbnailUrl?: string;
  accent: 'blue' | 'teal' | 'orange' | 'navy';
  featured?: boolean;
  priceLabel?: BilingualText;
  status: AdminCourseStatus;
  pendingApproval?: boolean;
  suspended?: boolean;
  lastUpdated: BilingualText;
  whatYouWillLearn: BilingualText[];
  objectives: BilingualText[];
  requirements: BilingualText[];
  targetAudience: BilingualText[];
  modules: PlatformModule[];
  resources: CourseResource[];
}

export interface PlatformStudent {
  id: string;
  fullName: BilingualText;
  initials: string;
  email: string;
  status: StudentAccountStatus;
  registeredAt: BilingualText;
  lastActivity: BilingualText;
  enrolledCourseSlugs: string[];
  avgProgress: number;
}

export interface PlatformReview {
  id: string;
  studentId: string;
  courseSlug: string;
  rating: number;
  comment: BilingualText;
  createdAt: BilingualText;
  status: ReviewStatus;
  moderationNote?: BilingualText;
}

export interface ApprovalHistoryItem {
  id: string;
  itemType: 'course' | 'lesson';
  title: BilingualText;
  courseSlug: string;
  decision: 'approved' | 'rejected';
  reason?: BilingualText;
  decidedAt: BilingualText;
}

export interface PlatformCommunityPost {
  id: string;
  courseSlug: string;
  authorName: BilingualText;
  authorRole: 'student' | 'instructor';
  initials: string;
  title?: BilingualText;
  content: BilingualText;
  timeLabel: BilingualText;
  isHidden: boolean;
  isReported: boolean;
  repliesCount: number;
}

export interface ModerationLogEntry {
  id: string;
  action: BilingualText;
  target: BilingualText;
  timestamp: BilingualText;
}

export interface NotificationEventConfig {
  key: string;
  label: BilingualText;
  enabled: boolean;
  subject: BilingualText;
  templateBody: BilingualText;
}

export interface PlatformSettingsState {
  platformNameEn: string;
  platformNameAr: string;
  taglineEn: string;
  taglineAr: string;
  defaultLanguage: 'ar' | 'en';
  defaultTheme: 'system' | 'light' | 'dark';
  allowPublicRegistration: boolean;
  requireEnrollmentApproval: boolean;
  requireLessonApproval: boolean;
  requireReviewModeration: boolean;
}

export interface PlatformActivityItem {
  id: string;
  kind: 'registration' | 'enrollment' | 'course' | 'lesson' | 'review' | 'instructor';
  message: BilingualText;
  timeLabel: BilingualText;
}
