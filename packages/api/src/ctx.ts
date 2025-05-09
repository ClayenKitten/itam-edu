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
import HomeworkRepository from "./courses/homework/repository";
import SubmissionRepository from "./courses/submission/repository";
import { LessonQuery } from "./courses/lesson/query";
import { HomeworksQuery } from "./courses/homework/query";
import { SubmissionQuery } from "./courses/submission/query";
import { CallService } from "./calls/service";
import { TelegramSender } from "./telegram/sender";
import { SessionRepository } from "./users/session";
import { LoginCodeRepository } from "./users/login";

/** Global context of the application. */
export type AppContext = ReturnType<typeof createAppContext>;

/** Creates static application context. */
export function createAppContext(config: AppConfig) {
    const databaseConnection = createDatabaseConnection(
        config.postgres.connectionString
    );

    const db = {
        user: new UserRepository(databaseConnection),
        session: new SessionRepository(databaseConnection),
        loginCode: new LoginCodeRepository(databaseConnection),
        course: new CourseRepository(databaseConnection),
        lesson: new LessonRepository(databaseConnection),
        lessonQuery: new LessonQuery(databaseConnection),
        homework: new HomeworkRepository(databaseConnection),
        homeworksQuery: new HomeworksQuery(databaseConnection),
        student: new StudentRepository(databaseConnection),
        staff: new StaffRepository(databaseConnection),
        submission: new SubmissionRepository(databaseConnection),
        submissionQuery: new SubmissionQuery(databaseConnection)
    };

    const telegramSender = new TelegramSender(config.redis);
    const notification = new NotificationService(db, telegramSender);
    const lesson = new LessonService(config, db, notification);
    const submission = new SubmissionService(config, db, notification);
    const call = new CallService(config.livekit);

    const services = { notification, lesson, submission, call, telegramSender };

    return {
        config,
        db,
        services
    };
}
