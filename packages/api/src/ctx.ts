import NotificationService from "./notifications/service";
import type { AppConfig } from "./config";
import createDatabaseConnection from "./db/connection";
import { LessonService } from "./courses/lesson/service";
import { SubmissionService } from "./courses/submission/service";

import UserRepository from "./users/repository";
import CourseRepository from "./courses/repository";
import LessonRepository from "./courses/lesson/repository";
import StudentRepository from "./courses/student/repository";
import StaffRepository from "./staff/repository";
import NotificationRepository from "./notifications/repository";
import HomeworkRepository from "./courses/homework/repository";
import SubmissionRepository from "./courses/submission/repository";
import { LessonQuery } from "./courses/lesson/query";
import { HomeworksQuery } from "./courses/homework/query";
import { SubmissionQuery } from "./courses/submission/query";
import { CallService } from "./calls/service";

/** Global context of the application. */
export type AppContext = ReturnType<typeof createAppContext>;

/** Creates static application context. */
export function createAppContext(config: AppConfig) {
    const databaseConnection = createDatabaseConnection(
        config.postgres.connectionString
    );

    const db = {
        user: new UserRepository(databaseConnection),
        course: new CourseRepository(databaseConnection),
        lesson: new LessonRepository(databaseConnection),
        lessonQuery: new LessonQuery(databaseConnection),
        homework: new HomeworkRepository(databaseConnection),
        homeworksQuery: new HomeworksQuery(databaseConnection),
        student: new StudentRepository(databaseConnection),
        staff: new StaffRepository(databaseConnection),
        notification: new NotificationRepository(databaseConnection),
        submission: new SubmissionRepository(databaseConnection),
        submissionQuery: new SubmissionQuery(databaseConnection)
    };

    const notification = new NotificationService(
        config.redis,
        db.user,
        db.notification
    );
    const lesson = new LessonService(config, db, notification);
    const submission = new SubmissionService(config, db, notification);
    const call = new CallService(config.livekit);
    const services = { notification, lesson, submission, call };

    return {
        config,
        db,
        services
    };
}
