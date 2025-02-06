import { Elysia, type AnyElysia } from "elysia";

import initContext from "./plugins";
import { courseController } from "./courses/controller";
import { userController } from "./users/controller";
import type AppConfig from "../config";
import Logger from "../logger";
import { mediaController } from "./media/controller";

export default class ApiServer {
    private elysia: Promise<AnyElysia>;
    private logger: Logger;

    public constructor(public readonly config: AppConfig) {
        this.logger = new Logger();
        this.elysia = new Promise(async resolve =>
            resolve(await this.createElysia())
        );
    }

    /** Starts serving. */
    public async start(): Promise<void> {
        const elysia = await this.elysia;
        elysia
            .onStart(() =>
                this.logger.info("Started API server", {
                    host: this.config.api.host,
                    port: this.config.api.port
                })
            )
            .onStop(() => this.logger.info("Stopped API server"))
            .listen({
                hostname: this.config.api.host,
                port: this.config.api.port
            });
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
            .use(await initContext(this.logger))
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
            .use(mediaController())
            .get("/healthz", () => "Ok", { tags: ["Infra"] });
    }
}

/** A top-levl ElysiaJS instance, exported for Eden Treaty usage in frontend. */
export type ApiTreaty = Awaited<
    ReturnType<InstanceType<typeof ApiServer>["createElysia"]>
>;
