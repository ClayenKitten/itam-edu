import NotificationService from "./notifications/service";
import { createConfig } from "./config";
import { createDatabaseContext } from "./db";
import createDatabaseConnection from "./db/connection";
import { LessonService } from "./courses/lesson/service";

/** Returns static application context. */
export function getAppContext(): AppContext {
    if (cache) return cache;
    cache = createAppContext();
    return cache;
}
let cache: AppContext | null = null;

export type AppContext = ReturnType<typeof createAppContext>;

function createAppContext() {
    const config = createConfig();
    const databaseConnection = createDatabaseConnection(
        config.db.connectionString
    );

    const db = createDatabaseContext(databaseConnection);

    const notification = new NotificationService(db.user, db.notification);
    const lesson = new LessonService(config, db, notification);

    return {
        config,
        db,
        notification,
        lesson
    };
}
