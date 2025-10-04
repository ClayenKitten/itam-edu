import { inject, injectable } from "inversify";
import { Elysia, type AnyElysia } from "elysia";
import { cors } from "@elysiajs/cors";

import logger from "../../logger";
import type { AppConfig } from "itam-edu-common/config";
import { NO_AUTHENTICATION, openapiPlugin } from "./openapi";
import { AppError, errorToHttpStatus } from "../../errors";

import { AuthenticationPlugin } from "./authn";
import { httpLoggerPlugin } from "./logger";

import { UserController } from "../../features/users/controller";
import { CourseController } from "../../features/courses/controller";
import { LessonController } from "../../features/courses/lesson/controller";
import { AttendanceController } from "../../features/courses/lesson/attendance/controller";
import { HomeworkController } from "../../features/courses/homework/controller";
import { StudentController } from "../../features/courses/student/controller";
import { SubmissionController } from "../../features/courses/submission/controller";
import { StaffController } from "../../features/courses/staff/controller";
import { InviteController } from "../../features/courses/staff/invites/controller";
import { CallController } from "../../features/calls/controller";
import { FileController } from "../../features/files/controller";

@injectable()
export class HttpServer {
    private elysia: Promise<AnyElysia>;

    public constructor(
        @inject("AppConfig")
        protected config: AppConfig,
        protected authPlugin: AuthenticationPlugin,
        protected userController: UserController,
        protected courseController: CourseController,
        protected lessonController: LessonController,
        protected attendanceController: AttendanceController,
        protected homeworkController: HomeworkController,
        protected studentController: StudentController,
        protected submissionController: SubmissionController,
        protected staffController: StaffController,
        protected inviteController: InviteController,
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
                    port: this.config.server.ports.backend
                })
            )
            .onStop(() => logger.info("Stopped API server"))
            .listen({ port: this.config.server.ports.backend });
    }

    /** Stops serving. */
    public async stop(dropActiveConnections = false): Promise<void> {
        const elysia = await this.elysia;
        await elysia.stop(dropActiveConnections);
    }

    private async createElysia() {
        return new Elysia({
            serve: { maxRequestBodySize: 5 * 1024 * 1024 * 1024 },
            strictPath: true
        })
            .onError(async ({ code, error, status }) => {
                if (error instanceof AppError) {
                    logger?.debug("Operation completed with a error", {
                        error: {
                            code: error.code,
                            message: error.message,
                            meta: error.meta,
                            cause: error.cause
                        }
                    });
                    const httpStatus = errorToHttpStatus(error);
                    return status(httpStatus, {
                        error: {
                            code: error.code,
                            message: error.message
                        } satisfies ErrorShape
                    });
                }
                if (code === "NOT_FOUND") {
                    return status(404, {
                        error: {
                            code: "unknown-route",
                            message: "Неверный путь запроса к API"
                        } satisfies ErrorShape
                    });
                }
                logger?.error("Unhandled error", {
                    error,
                    stack: (error as Error).stack
                });
            })
            .use(cors({ origin: true }))
            .use(openapiPlugin())
            .use(this.authPlugin.toElysia())
            .use(httpLoggerPlugin())
            .use(this.userController.toElysia())
            .use(this.courseController.toElysia())
            .use(this.lessonController.toElysia())
            .use(this.homeworkController.toElysia())
            .use(this.studentController.toElysia())
            .use(this.attendanceController.toElysia())
            .use(this.submissionController.toElysia())
            .use(this.staffController.toElysia())
            .use(this.inviteController.toElysia())
            .use(this.callController.toElysia())
            .use(this.fileController.toElysia())
            .get("/healthz", () => "Ok", {
                tags: ["Infra"],
                detail: {
                    summary: "Healthcheck",
                    description: "Always returns `200 Ok`.",
                    security: NO_AUTHENTICATION
                }
            });
    }
}

/** A top-levl ElysiaJS instance, exported for Eden Treaty usage in frontend. */
export type ApiTreaty = Awaited<
    ReturnType<InstanceType<typeof HttpServer>["createElysia"]>
>;

export type ErrorShape = {
    code: string;
    message: string;
};
