import { injectable } from "inversify";
import { Elysia, type AnyElysia } from "elysia";

import logger from "../logger";
import { AppConfig } from "../config";
import { UserRepository } from "../users/repository";

import { docsPlugin, NO_AUTHENTICATION } from "./plugins/docs";
import { corsPlugin } from "./plugins/cors";
import { authenticationPlugin } from "./plugins/authenticate";
import { httpLoggerPlugin } from "./plugins/logger";

import { UserController } from "../users/controller";
import { CourseController } from "../courses/controller";
import { LessonController } from "../courses/lesson/controller";
import { HomeworkController } from "../courses/homework/controller";
import { StudentController } from "../courses/student/controller";
import { SubmissionController } from "../courses/submission/controller";
import { StaffController } from "../courses/staff/controller";
import { CallController } from "../calls/controller";
import { FileController } from "../courses/files/controller";

@injectable()
export class ApiServer {
    private elysia: Promise<AnyElysia>;

    public constructor(
        protected config: AppConfig,
        protected userRepo: UserRepository,
        protected userController: UserController,
        protected courseController: CourseController,
        protected lessonController: LessonController,
        protected homeworkController: HomeworkController,
        protected studentController: StudentController,
        protected submissionController: SubmissionController,
        protected staffController: StaffController,
        protected callController: CallController,
        protected fileController: FileController
    ) {
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
                    port: this.config.api.port
                })
            )
            .onStop(() => logger.info("Stopped API server"))
            .listen({ port: this.config.api.port });
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
            .use(docsPlugin())
            .use(authenticationPlugin(this.userRepo))
            .use(httpLoggerPlugin())
            .onError(async ctx => {
                logger?.error("Unhandled Exception", {
                    error: ctx.error,
                    stack: (ctx.error as Error).stack
                });
            })
            .use(this.userController.toElysia())
            .use(this.courseController.toElysia())
            .use(this.lessonController.toElysia())
            .use(this.homeworkController.toElysia())
            .use(this.studentController.toElysia())
            .use(this.submissionController.toElysia())
            .use(this.staffController.toElysia())
            .use(this.callController.toElysia())
            .use(this.fileController.toElysia())
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
