import Database from "./db";
import NotificationService from "./notifications/service";
import { createConfig } from "./config";

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
    const db = new Database(config.db.connectionString);
    return {
        config,
        db,
        notification: new NotificationService(db.user, db.notification)
    };
}
