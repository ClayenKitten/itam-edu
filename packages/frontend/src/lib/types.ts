import { privateUserInfo } from "itam-edu-api/src/users/schema";
import { course } from "itam-edu-api/src/courses/schema";
import type {
    CreateLessonDTO,
    LessonDTO,
    LessonPartialDTO
} from "itam-edu-api/src/courses/lesson/query";
import { homework } from "itam-edu-api/src/courses/homework/schema";
import { submission } from "itam-edu-api/src/courses/submission/schema";

export type PrivateUserInfo = typeof privateUserInfo.static;
export type Course = typeof course.static;
export type Lesson = LessonDTO;
export type LessonPartial = LessonPartialDTO;
export type CreateLesson = CreateLessonDTO;
export type Homework = typeof homework.static;
export type Submission = typeof submission.static;
