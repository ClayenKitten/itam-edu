import { course } from "itam-edu-api/src/courses/schema";
import {
    lesson,
    lessonWithoutContent
} from "itam-edu-api/src/courses/lesson/schema";
import { homework } from "itam-edu-api/src/courses/homework/schema";
import { submission } from "itam-edu-api/src/courses/submission/schema";

export type Course = typeof course.static;
export type Lesson = typeof lesson.static;
export type LessonWithoutContent = typeof lessonWithoutContent.static;
export type Homework = typeof homework.static;
export type Submission = typeof submission.static;
