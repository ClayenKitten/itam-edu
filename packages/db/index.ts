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
  banner: string | null;
  colorOnPrimary: string | null;
  colorPrimary: string | null;
  /**
   * Multi-line description of the course
   */
  description: string | null;
  id: Generated<string>;
  isArchived: Generated<boolean>;
  isBlogEnabled: Generated<boolean>;
  isEnrollmentOpen: Generated<boolean>;
  isFeedbackEnabled: Generated<boolean>;
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
   * Whether user can write posts to blog
   */
  canManageBlog: Generated<boolean>;
  /**
   * Whether user can modify feedback form
   */
  canManageFeedback: Generated<boolean>;
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

export interface HomeworkSubmissions {
  homeworkId: string;
  id: Generated<string>;
  reviewAccepted: boolean | null;
  reviewedAt: Timestamp | null;
  reviewerComment: string | null;
  reviewerId: string | null;
  solution: string;
  studentComment: string | null;
  studentId: string;
  submittedAt: Generated<Timestamp>;
}

export interface Lessons {
  /**
   * HTML content of the lesson
   */
  content: string | null;
  courseId: string;
  /**
   * URL of the lesson icon
   */
  icon: string | null;
  position: number;
  /**
   * Machine-readable name of the lesson that is unique within a course
   */
  slug: string;
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
  isStaff: Generated<boolean>;
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
  homeworkSubmissions: HomeworkSubmissions;
  lessons: Lessons;
  notificationMessages: NotificationMessages;
  notifications: Notifications;
  schemaMigrations: SchemaMigrations;
  userLoginAttempts: UserLoginAttempts;
  users: Users;
  userSessions: UserSessions;
}
