import { Hono } from "hono";
import { env } from "process";
import { serve } from "@hono/node-server";

import { courseService } from "./services/course/controller.js";
import { userService } from "./services/user.js";

import logger, { loggerMiddleware } from "./logger.js";
import { bodyLimit } from "hono/body-limit";
import createContext, { type AppEnv } from "./ctx.js";
import { cors } from "hono/cors";

const port = Number(env.ITAM_EDU_API_PORT) ?? 3000;

const app = await createApp();

export async function createApp() {
    return new Hono<AppEnv>()
        .use(loggerMiddleware())
        .use(bodyLimit({ maxSize: 50 * 1024 * 1024 }))
        .use(
            cors({
                origin:
                    env.NODE_ENV === "development"
                        ? "*"
                        : env.ITAM_EDU_API_HOST!
            })
        )
        .use(createContext)
        .route("/courses", await courseService())
        .route("/users", await userService())
        .get("/healthz", c => c.body(null, 200));
}

const server = serve({ fetch: app.fetch, hostname: "0.0.0.0", port }, info => {
    logger.notice(`Listening at http://${info.address}:${info.port}`);
});

export type AppType = Awaited<ReturnType<typeof createApp>>;
