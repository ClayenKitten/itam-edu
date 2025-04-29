import NotificationService from "./notifications/service";
import type { AppConfig } from "./config";
import { createDatabaseContext } from "./db";
import createDatabaseConnection from "./db/connection";
import { LessonService } from "./courses/lesson/service";
import { SubmissionService } from "./courses/submission/service";

/** Global context of the application. */
export type AppContext = ReturnType<typeof createAppContext>;

/** Creates static application context. */
export function createAppContext(config: AppConfig) {
    const databaseConnection = createDatabaseConnection(
        config.db.connectionString
    );

    const db = createDatabaseContext(databaseConnection);

    const notification = new NotificationService(db.user, db.notification);
    const lesson = new LessonService(config, db, notification);
    const submission = new SubmissionService(config, db, notification);
    const services = { notification, lesson, submission };

    return {
        config,
        db,
        services
    };
}
