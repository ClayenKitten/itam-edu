import { createMiddleware } from "hono/factory";
import createDatabaseConnection from "./db.js";
import type { Kysely } from "kysely";
import type { DB } from "itam-edu-db";
import CourseRepository from "./services/course/repository.js";
import UserRepository from "./services/user/repository.js";
import type { UserSchema } from "./services/user/schema.js";
import LessonRepository from "./services/course/lesson/repository.js";
import StudentRepository from "./services/course/student/repository.js";

const createContext = createMiddleware<AppEnv>(async (c, next) => {
    c.set("db", createDatabaseConnection());
    c.set("repo", createRepositories(c.var.db));
    await next();
});
export default createContext;

function createRepositories(db: Kysely<DB>) {
    return {
        user: new UserRepository(db),
        course: new CourseRepository(db),
        lesson: new LessonRepository(db),
        student: new StudentRepository(db)
    };
}

export type Ctx = {
    db: Kysely<DB>;
    repo: ReturnType<typeof createRepositories>;
    user: UserSchema | null;
};

export type AppEnv = { Variables: Ctx };
