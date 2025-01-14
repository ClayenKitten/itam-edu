import { Hono } from "hono";
import { env } from "process";
import { serve } from "@hono/node-server";
import logger from "./logger.js";
import { bodyLimit } from "hono/body-limit";
import createContext, { type AppEnv } from "./ctx.js";
import { cors } from "hono/cors";
import { loggerMiddleware } from "./middlewares/logger.js";
import { authentication } from "./middlewares/authentication.js";
import { HTTPException } from "hono/http-exception";

import { courseController } from "./services/course/controller.js";
import { userController } from "./services/user/controller.js";
import { botController } from "./services/bot.js";

const port = Number(env.ITAM_EDU_API_PORT) ?? 3000;

const app = await createApp();

export async function createApp() {
    return new Hono<AppEnv>()
        .use(loggerMiddleware())
        .use(bodyLimit({ maxSize: 50 * 1024 * 1024 }))
        .use(
            cors({
                origin:
                    env.NODE_ENV === "production"
                        ? env.ITAM_EDU_API_HOST!
                        : c => c,
                credentials: env.NODE_ENV === "development"
            })
        )
        .use(createContext)
        .use(authentication())
        .onError(async (error, c) => {
            if (error instanceof HTTPException) {
                return error.getResponse();
            }
            logger.error("Unhandled Exception", {
                exceptionKind: error?.constructor?.name,
                error
            });
            return c.text("Internal Server Error", 500);
        })
        .route("/courses", await courseController())
        .route("/users", await userController())
        .route("/bot", await botController())
        .get("/healthz", c => c.body(null, 200));
}

const server = serve({ fetch: app.fetch, hostname: "0.0.0.0", port }, info => {
    logger.notice(`Listening at http://${info.address}:${info.port}`);
});

export type AppType = Awaited<ReturnType<typeof createApp>>;
