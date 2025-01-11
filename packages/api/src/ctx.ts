import { createMiddleware } from "hono/factory";
import createDatabaseConnection from "./db.js";
import type { Kysely } from "kysely";
import type { DB } from "itam-edu-db";
import CourseRepository from "./services/course/repository.js";
import UserRepository from "./services/user/repository.js";
import type { UserSchema } from "./services/user/schema.js";

const createContext = createMiddleware<AppEnv>(async (c, next) => {
    c.set("db", createDatabaseConnection());
    c.set("repo", {
        course: new CourseRepository(c.get("db")),
        user: new UserRepository(c.get("db"))
    });
    await next();
});

export type Ctx = {
    db: Kysely<DB>;
    repo: {
        course: CourseRepository;
        user: UserRepository;
    };
    user: UserSchema | null;
};

export type AppEnv = { Variables: Ctx };

export default createContext;
