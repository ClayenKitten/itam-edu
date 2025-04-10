/**
 * This file was generated by kysely-codegen.
 * Please do not edit it manually.
 */

import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Int8 = ColumnType<string, bigint | number | string, bigint | number | string>;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface Courses {
  about: Generated<string>;
  banner: string | null;
  colorOnPrimary: string | null;
  colorPrimary: string | null;
  /**
   * Multi-line description of the course
   */
  description: string | null;
  id: Generated<string>;
  isArchived: Generated<boolean>;
  isEnrollmentOpen: Generated<boolean>;
  isPublished: Generated<boolean>;
  /**
   * URL of the course logo
   */
  logo: string | null;
  /**
   * Optional semester in which the course takes place
   */
  semester: number | null;
  /**
   * Machine-readable name of the course that is unique in combination with year and semester
   */
  slug: string;
  status: string | null;
  /**
   * Human-readable name of the course
   */
  title: string;
  /**
   * Year in which the course takes place
   */
  year: Generated<number>;
}

export interface CourseStaff {
  /**
   * Whether user can edit course content such as lessons, homeworks, etc
   */
  canEditContent: Generated<boolean>;
  /**
   * Whether user can edit primary course info
   */
  canEditInfo: Generated<boolean>;
  /**
   * Whether user can accept or reject submissions
   */
  canManageSubmissions: Generated<boolean>;
  courseId: string;
  /**
   * Whether user is owner of the course. Course owners can manage staff, add other owners and even delete courses
   */
  isOwner: Generated<boolean>;
  title: string | null;
  userId: string;
}

export interface CourseStudents {
  courseId: string;
  userId: string;
}

export interface Homeworks {
  acceptingSubmissionsOverride: boolean | null;
  content: string | null;
  courseId: string;
  createdAt: Generated<Timestamp>;
  deadline: Timestamp | null;
  id: Generated<string>;
  position: number;
  title: string;
}

export interface HomeworkSubmissionMessages {
  accepted: boolean | null;
  content: string;
  homeworkId: string;
  id: Generated<string>;
  sentAt: Generated<Timestamp>;
  studentId: string;
  userId: string | null;
}

export interface HomeworkSubmissions {
  accepted: boolean | null;
  homeworkId: string | null;
  lastMessageAt: Timestamp | null;
  studentId: string | null;
}

export interface LessonHomeworks {
  homeworkId: string;
  lessonId: string;
  position: number;
}

export interface Lessons {
  /**
   * URL of the lesson icon
   */
  banner: string | null;
  /**
   * HTML content of the lesson
   */
  content: string | null;
  courseId: string;
  createdAt: Generated<Timestamp>;
  description: string | null;
  /**
   * Machine-readable name of the lesson that is unique within a course
   */
  id: Generated<string>;
  isOffline: boolean;
  isOnline: boolean;
  location: string | null;
  position: number;
  scheduledAt: Timestamp | null;
  /**
   * Human-readable name of the lesson
   */
  title: string;
}

export interface NotificationMessages {
  notificationId: string;
  sentAt: Generated<Timestamp>;
  tgMessageId: Int8 | null;
  userId: string;
}

export interface Notifications {
  createdAt: Generated<Timestamp>;
  id: Generated<string>;
  senderId: string | null;
  text: string;
}

export interface SchemaMigrations {
  version: string;
}

export interface UserLoginAttempts {
  code: string;
  expires: Timestamp;
  userId: string;
}

export interface Users {
  /**
   * URL of the user avatar
   */
  avatar: string | null;
  bio: string | null;
  canCreateCourses: Generated<boolean>;
  canPublishCourses: Generated<boolean>;
  email: string | null;
  firstName: string | null;
  id: Generated<string>;
  isSupervisor: Generated<boolean>;
  lastName: string | null;
  patronim: string | null;
  tgChatId: Int8;
  tgUserId: Int8;
  tgUsername: string;
}

export interface UserSessions {
  expires: Timestamp;
  id: Generated<string>;
  token: string;
  userId: string;
}

export interface DB {
  courses: Courses;
  courseStaff: CourseStaff;
  courseStudents: CourseStudents;
  homeworks: Homeworks;
  homeworkSubmissionMessages: HomeworkSubmissionMessages;
  homeworkSubmissions: HomeworkSubmissions;
  lessonHomeworks: LessonHomeworks;
  lessons: Lessons;
  notificationMessages: NotificationMessages;
  notifications: Notifications;
  schemaMigrations: SchemaMigrations;
  userLoginAttempts: UserLoginAttempts;
  users: Users;
  userSessions: UserSessions;
}
