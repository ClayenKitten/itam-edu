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
  archived: Generated<boolean>;
  blogEnabled: Generated<boolean>;
  /**
   * Multi-line description of the course
   */
  description: string | null;
  enrollmentOpen: Generated<boolean>;
  feedbackEnabled: Generated<boolean>;
  id: Generated<string>;
  /**
   * URL of the course logo
   */
  logo: string | null;
  public: Generated<boolean>;
  /**
   * Optional semester in which the course takes place
   */
  semester: number | null;
  /**
   * Machine-readable name of the course that is unique in combination with year and semester
   */
  slug: string;
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
  admin: Generated<boolean>;
  canEditContent: Generated<boolean>;
  canEditInfo: Generated<boolean>;
  canGradeHomeworks: Generated<boolean>;
  canManageBlog: Generated<boolean>;
  canManageFeedback: Generated<boolean>;
  courseId: string;
  title: string | null;
  userId: string;
}

export interface CourseStudents {
  courseId: string;
  userId: string;
}

export interface Homeworks {
  content: string;
  courseId: string;
  id: Generated<string>;
  isSolutionMultiline: boolean;
  lesson: string;
  solutionSyntaxHighlighting: string | null;
  title: string;
}

export interface HomeworkSubmissions {
  /**
   * Whether homework is accepted or rejected by teacher. If set to NULL, it is not reviewed yet.
   */
  accepted: boolean | null;
  attempt: number;
  /**
   * Student comment
   */
  comment: Generated<string>;
  /**
   * Feedback from reviewer
   */
  feedback: Generated<string>;
  homeworkId: string;
  reviewerId: string | null;
  /**
   * Homework solution, usually in form of text or of an URL
   */
  solution: string;
  studentId: string;
  submittedAt: Generated<Timestamp | null>;
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

export interface LoginAttempts {
  code: string;
  expires: Timestamp;
  id: Generated<string>;
  userId: string;
}

export interface ManualNotifications {
  content: string;
  createdAt: Generated<Timestamp>;
  deleted: Generated<boolean>;
  id: Generated<string>;
  silent: boolean;
}

export interface Notifications {
  content: string;
  id: Generated<string>;
  manualId: string | null;
  tgMessageId: Int8;
  userId: string;
}

export interface SchemaMigrations {
  version: string;
}

export interface StaffPermissions {
  canCreateCourses: Generated<boolean>;
  canPublishCourses: Generated<boolean>;
  userId: string;
}

export interface Users {
  /**
   * URL of the user avatar
   */
  avatar: string | null;
  bio: string | null;
  email: string | null;
  firstName: string | null;
  id: Generated<string>;
  lastName: string | null;
  patronim: string | null;
  tgChatId: Int8;
  tgUserId: Int8;
  tgUsername: string;
}

export interface UserSessions {
  expires: Timestamp;
  id: Generated<string>;
  tokenHash: string;
  userId: string;
}

export interface DB {
  courses: Courses;
  courseStaff: CourseStaff;
  courseStudents: CourseStudents;
  homeworks: Homeworks;
  homeworkSubmissions: HomeworkSubmissions;
  lessons: Lessons;
  loginAttempts: LoginAttempts;
  manualNotifications: ManualNotifications;
  notifications: Notifications;
  schemaMigrations: SchemaMigrations;
  staffPermissions: StaffPermissions;
  users: Users;
  userSessions: UserSessions;
}
