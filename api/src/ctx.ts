import { createMiddleware } from "hono/factory";
import type { AppEnv } from "./index.js";
import createDatabaseConnection from "./db.js";

const createContext = createMiddleware<AppEnv>(async (c, next) => {
    c.set("db", createDatabaseConnection());
    await next();
});

export default createContext;
