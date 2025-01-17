import { Elysia } from "elysia";
import { env } from "process";

import initContext from "./plugins";
import { botController } from "./services/bot";
import { courseController } from "./services/course/controller";
import { userController } from "./services/user/controller";

const app = new Elysia({
    serve: { maxRequestBodySize: 50 * 1024 * 1024 },
    strictPath: true
})
    .use(await initContext())
    .onError(async ({ logger, ...ctx }) => {
        if (ctx.code === "UNKNOWN") {
            logger?.error("Unhandled Exception", {
                exceptionKind: ctx.error?.constructor?.name,
                name: ctx.error.name,
                message: ctx.error.message,
                cause: ctx.error.cause,
                stack: ctx.error.stack
            });
        }
    })
    .use(courseController("/courses"))
    .use(userController("/users"))
    .use(botController("/bot"))
    .get("/healthz", () => "Ok")
    .listen(Number(env.ITAM_EDU_API_PORT) ?? 3000);

export type AppType = typeof app;
