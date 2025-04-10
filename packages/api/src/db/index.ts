import type { Kysely } from "kysely";
import type { DB } from "itam-edu-db";

import UserRepository from "../users/repository";
import CourseRepository from "../courses/repository";
import LessonRepository from "../courses/lesson/repository";
import StudentRepository from "../courses/student/repository";
import StaffRepository from "../staff/repository";
import NotificationRepository from "../notifications/repository";
import HomeworkRepository from "../courses/homework/repository";
import SubmissionRepository from "../courses/submission/repository";
import { LessonQuery } from "../courses/lesson/query";
import { HomeworksQuery } from "../courses/homework/query";
import { SubmissionQuery } from "../courses/submission/query";

export function createDatabaseContext(connection: Kysely<DB>) {
    return {
        user: new UserRepository(connection),
        course: new CourseRepository(connection),
        lesson: new LessonRepository(connection),
        lessonQuery: new LessonQuery(connection),
        homework: new HomeworkRepository(connection),
        homeworksQuery: new HomeworksQuery(connection),
        student: new StudentRepository(connection),
        staff: new StaffRepository(connection),
        notification: new NotificationRepository(connection),
        submission: new SubmissionRepository(connection),
        submissionQuery: new SubmissionQuery(connection)
    };
}

export type DataAccessServices = ReturnType<typeof createDatabaseContext>;
