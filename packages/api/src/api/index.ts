import { Elysia, type AnyElysia } from "elysia";

import initContext from "./plugins";
import { courseController } from "../courses/controller";
import { userController } from "../users/controller";
import logger from "../logger";
import { mediaController } from "../media/controller";
import type { AppContext } from "../ctx";
import { NO_AUTHENTICATION } from "./plugins/docs";
import { staffController } from "../staff/controller";
import { HttpError } from "./errors";

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
        elysia.stop(dropActiveConnections);
    }

    private async createElysia() {
        return new Elysia({
            serve: { maxRequestBodySize: 50 * 1024 * 1024 },
            strictPath: true
        })
            .use(await initContext())
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
            .use(courseController("/courses"))
            .use(userController("/users"))
            .use(staffController())
            .use(mediaController())
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
