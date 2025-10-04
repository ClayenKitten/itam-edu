import { injectable } from "inversify";
import { Elysia, t } from "elysia";
import { REQUIRE_TOKEN } from "../../../../ports/http/openapi";
import { HttpError } from "../../../../api/errors";
import { AuthenticationPlugin } from "../../../../ports/http/authn";
import { AttendanceQuery } from "./query";
import { ManuallyAddAttendance } from "./addManually.interactor";
import { RemoveAttendance } from "./remove.interactor";
import { CreateAttendanceToken } from "./token/create.interactor";
import { ApplyAttendanceToken } from "./token/apply.interactor";

@injectable()
export class AttendanceController {
    public constructor(
        private authPlugin: AuthenticationPlugin,
        private attendanceQuery: AttendanceQuery,
        private manuallyAdd: ManuallyAddAttendance,
        private remove: RemoveAttendance,
        private createToken: CreateAttendanceToken,
        private applyToken: ApplyAttendanceToken
    ) {}

    public toElysia() {
        return new Elysia({
            name: "attendance",
            prefix: "/courses/:course/lessons",
            tags: ["Attendance"]
        })
            .use(this.authPlugin.toElysia())
            .get(
                "/attendees",
                async ({ user, params, status }) => {
                    const result = await this.attendanceQuery.get(
                        user,
                        params.course,
                        null
                    );
                    if (result instanceof HttpError) {
                        return status(result.code, result.message);
                    }
                    return result;
                },
                {
                    requireAuthentication: true,
                    params: t.Object({
                        course: t.String({ format: "uuid" })
                    }),
                    detail: {
                        summary: "Get attendees",
                        description: "Returns attendees for all lessons.",
                        security: REQUIRE_TOKEN
                    }
                }
            )
            .get(
                "/:lesson/attendees",
                async ({ user, params, status }) => {
                    const result = await this.attendanceQuery.get(
                        user,
                        params.course,
                        params.lesson
                    );
                    if (result instanceof HttpError) {
                        return status(result.code, result.message);
                    }
                    return result;
                },
                {
                    requireAuthentication: true,
                    params: t.Object({
                        course: t.String({ format: "uuid" }),
                        lesson: t.String({ format: "uuid" })
                    }),
                    detail: {
                        summary: "Get lesson attendees",
                        description: "Returns attendees of the lesson.",
                        security: REQUIRE_TOKEN
                    }
                }
            )
            .put(
                "/:lesson/attendees/:user",
                async ({ user, params, body, status }) => {
                    const result = await this.manuallyAdd.invoke(
                        user,
                        params.course,
                        params.lesson,
                        params.user,
                        body.format
                    );
                    if (result instanceof HttpError) {
                        return status(result.code, result.message);
                    }
                },
                {
                    requireAuthentication: true,
                    body: t.Object({
                        format: t.Union([
                            t.Literal("online"),
                            t.Literal("offline")
                        ])
                    }),
                    params: t.Object({
                        course: t.String({ format: "uuid" }),
                        lesson: t.String({ format: "uuid" }),
                        user: t.String({ format: "uuid" })
                    }),
                    detail: {
                        summary: "Add user to attendees",
                        description: "Manually adds user to lesson attendees.",
                        security: REQUIRE_TOKEN
                    }
                }
            )
            .delete(
                "/:lesson/attendees/:user",
                async ({ user, params, status }) => {
                    const result = await this.remove.invoke(
                        user,
                        params.course,
                        params.lesson,
                        params.user
                    );
                    if (result instanceof HttpError) {
                        return status(result.code, result.message);
                    }
                },
                {
                    requireAuthentication: true,
                    params: t.Object({
                        course: t.String({ format: "uuid" }),
                        lesson: t.String({ format: "uuid" }),
                        user: t.String({ format: "uuid" })
                    }),
                    detail: {
                        summary: "Remove user from attendees",
                        description: "Removes user from lesson attendees.",
                        security: REQUIRE_TOKEN
                    }
                }
            )
            .post(
                "/:lesson/attendance-tokens",
                async ({ user, params, status }) => {
                    const result = await this.createToken.invoke(
                        user,
                        params.course,
                        params.lesson
                    );
                    if (result instanceof HttpError) {
                        return status(result.code, result.message);
                    }
                    return result;
                },
                {
                    requireAuthentication: true,
                    params: t.Object({
                        course: t.String({ format: "uuid" }),
                        lesson: t.String({ format: "uuid" })
                    }),
                    detail: {
                        summary: "Create attendance token",
                        description: "Creates an attendance token.",
                        security: REQUIRE_TOKEN
                    }
                }
            )
            .post(
                "/:lesson/attendance-tokens/apply",
                async ({ user, body }) => {
                    return await this.applyToken.invoke(user, body.token);
                },
                {
                    requireAuthentication: true,
                    body: t.Object({
                        token: t.String()
                    }),
                    params: t.Object({
                        course: t.String({ format: "uuid" }),
                        lesson: t.String({ format: "uuid" })
                    }),
                    detail: {
                        summary: "Apply attendance token",
                        description: "Applies an attendance token.",
                        security: REQUIRE_TOKEN
                    }
                }
            );
    }
}
