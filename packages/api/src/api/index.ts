import { Elysia, type AnyElysia } from "elysia";

import logger from "../logger";
import type { AppContext } from "../ctx";
import { docsPlugin, NO_AUTHENTICATION } from "./plugins/docs";
import { corsPlugin } from "./plugins/cors";
import { authenticationPlugin } from "./plugins/authenticate";
import { httpLoggerPlugin } from "./plugins/logger";

import { userController } from "../users/controller";
import { courseController } from "../courses/controller";
import { lessonController } from "../courses/lesson/controller";
import { homeworkController } from "../courses/homework/controller";
import { studentController } from "../courses/student/controller";
import { submissionController } from "../courses/submission/controller";
import { staffController } from "../staff/controller";
import { mediaController } from "../media/controller";

export default class ApiServer {
    private elysia: Promise<AnyElysia>;

    public constructor(public ctx: AppContext) {
        this.elysia = new Promise(async resolve =>
            resolve(await this.createElysia())
        );
    }

    /** Starts serving. */
    public async start(): Promise<void> {
        const elysia = await this.elysia;
        elysia
            .onStart(() =>
                logger.info("Started API server", {
                    port: this.ctx.config.api.port
                })
            )
            .onStop(() => logger.info("Stopped API server"))
            .listen({ port: this.ctx.config.api.port });
    }

    /** Stops serving. */
    public async stop(dropActiveConnections = false): Promise<void> {
        const elysia = await this.elysia;
        await elysia.stop(dropActiveConnections);
    }

    private async createElysia() {
        return new Elysia({
            serve: { maxRequestBodySize: 50 * 1024 * 1024 },
            strictPath: true
        })
            .use(corsPlugin())
            .use(await docsPlugin())
            .use(authenticationPlugin(this.ctx))
            .use(httpLoggerPlugin())
            .onError(async ctx => {
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
            .use(userController(this.ctx))
            .use(courseController(this.ctx))
            .use(lessonController(this.ctx))
            .use(homeworkController(this.ctx))
            .use(submissionController(this.ctx))
            .use(studentController(this.ctx))
            .use(staffController(this.ctx))
            .use(mediaController(this.ctx))
            .get("/healthz", () => "Ok", {
                tags: ["Infra"],
                detail: {
                    summary: "Healthcheck",
                    description:
                        "Healthcheck endpoint that always returns 200.",
                    security: NO_AUTHENTICATION
                }
            });
    }
}

/** A top-levl ElysiaJS instance, exported for Eden Treaty usage in frontend. */
export type ApiTreaty = Awaited<
    ReturnType<InstanceType<typeof ApiServer>["createElysia"]>
>;
