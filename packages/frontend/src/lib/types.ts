import { course } from "itam-edu-api/src/courses/schema";
import type {
    CreateLessonDTO,
    LessonDTO,
    LessonPartialDTO
} from "itam-edu-api/src/courses/lesson/query";
import type {
    CreateHomeworkDTO,
    HomeworkDTO,
    HomeworkPartialDTO
} from "itam-edu-api/src/courses/homework/query";
import type {
    SubmissionDTO,
    SubmissionPartialDTO
} from "itam-edu-api/src/courses/submission/query";

export type Course = typeof course.static;

export type Lesson = LessonDTO;
export type LessonPartial = LessonPartialDTO;
export type CreateLesson = CreateLessonDTO;

export type Homework = HomeworkDTO;
export type HomeworkPartial = HomeworkPartialDTO;
export type CreateHomework = CreateHomeworkDTO;

export type Submission = SubmissionDTO;
export type SubmissionPartial = SubmissionPartialDTO;
