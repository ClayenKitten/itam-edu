import { createMiddleware } from "hono/factory";
import createDatabaseConnection from "./db.js";
import type { Kysely } from "kysely";
import type { DB } from "itam-edu-db";
import CourseRepository from "./services/course/repository.js";

const createContext = createMiddleware<AppEnv>(async (c, next) => {
    c.set("db", createDatabaseConnection());
    c.set("repo", {
        course: new CourseRepository(c.get("db"))
    });
    await next();
});

export type Ctx = {
    db: Kysely<DB>;
    repo: {
        course: CourseRepository;
    };
};

export type AppEnv = { Variables: Ctx };

export default createContext;
