import { Elysia } from "elysia";
import { env } from "process";
import logger, { Logger } from "../logger";

import CourseRepository from "../../services/course/repository";
import UserRepository from "../../services/user/repository";
import LessonRepository from "../../services/course/lesson/repository";
import StudentRepository from "../../services/course/student/repository";

export default function db() {
    return new Elysia({ name: "db" })
        .use(logger())
        .derive(({ logger }) => {
            const connectionString = env.ITAM_EDU_API_DB_CONNECTION_STRING!;
            return {
                db: createRepositories(connectionString, logger)
            };
        })
        .as("plugin");
}

function createRepositories(conn: string, logger: Logger) {
    return {
        user: new UserRepository(conn, logger),
        course: new CourseRepository(conn, logger),
        lesson: new LessonRepository(conn, logger),
        student: new StudentRepository(conn, logger)
    };
}
export type Repositories = ReturnType<typeof createRepositories>;
