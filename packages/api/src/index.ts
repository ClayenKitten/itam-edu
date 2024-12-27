import { Hono } from "hono";
import type { DB } from "itam-edu-db";
import type { Kysely } from "kysely";
import { env } from "process";
import { serve } from "@hono/node-server";

import { courseService } from "./services/course.js";
import { userService } from "./services/user.js";

import logger, { loggerMiddleware } from "./logger.js";
import { bodyLimit } from "hono/body-limit";
import createContext from "./ctx.js";

const hostname = "0.0.0.0";
const port = Number(env.ITAM_EDU_API_PORT) ?? 3000;

const app = await createApp();

export async function createApp() {
    return new Hono<AppEnv>()
        .use(bodyLimit({ maxSize: 50 * 1024 * 1024 }))
        .use(loggerMiddleware())
        .use(createContext)
        .route("/courses", await courseService())
        .route("/users", await userService())
        .get("/healthz", c => c.body(null, 200));
}

export type AppEnv = {
    Variables: {
        db: Kysely<DB>;
    };
};

const server = serve({ fetch: app.fetch, hostname, port }, info => {
    logger.notice(`Listening at http://${info.address}:${info.port}`);
});

export type AppType = Awaited<ReturnType<typeof createApp>>;
