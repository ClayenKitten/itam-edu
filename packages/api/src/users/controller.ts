import { injectable } from "inversify";
import { Elysia, t } from "elysia";
import { NO_AUTHENTICATION, REQUIRE_TOKEN } from "../api/plugins/docs";
import { AuthenticationPlugin } from "../api/plugins/authenticate";
import { UserRepository } from "./repository";
import { CalendarQuery, type CalendarFilters } from "./calendar";
import { UserLogin } from "./login";
import { NotificationsQuery } from "./notifications/query";
import * as schema from "./schema";
import { SessionRepository } from "./sessions/repository";
import { UserQuery } from "./query";
import { HttpError } from "../api/errors";

@injectable()
export class UserController {
    public constructor(
        private authPlugin: AuthenticationPlugin,
        private userRepo: UserRepository,
        private userQuery: UserQuery,
        private sessionRepo: SessionRepository,
        private login: UserLogin,
        private calendarQuery: CalendarQuery,
        private notificationsQuery: NotificationsQuery
    ) {}

    public toElysia() {
        return new Elysia({ prefix: "/users", tags: ["Users"] })
            .use(this.authPlugin.toElysia())
            .get(
                "",
                async ({ user, status }) => {
                    const result = await this.userQuery.getAll(user);
                    if (result instanceof HttpError) {
                        return status(result.code, result.message);
                    }
                    return result;
                },
                {
                    requireAuthentication: true,
                    detail: {
                        summary: "Get current user",
                        description:
                            "Returns information about the current user.",
                        security: REQUIRE_TOKEN
                    }
                }
            )
            .get(
                "/me",
                async ({ user }) => {
                    return {
                        user: {
                            id: user.id,
                            info: user.info,
                            telegram: user.telegram,
                            courses: user.courses
                        }
                    };
                },
                {
                    requireAuthentication: true,
                    detail: {
                        summary: "Get current user",
                        description:
                            "Returns information about the current user.",
                        security: REQUIRE_TOKEN
                    }
                }
            )
            .patch(
                "/me",
                async ({ user, body }) => {
                    await this.userRepo.update(user, body);
                },
                {
                    requireAuthentication: true,
                    body: schema.updateUser,
                    detail: {
                        summary: "Updates current user",
                        description:
                            "Updates information about the current user.",
                        security: REQUIRE_TOKEN
                    }
                }
            )
            .post(
                "/sessions",
                async ({ body, status, cookie }) => {
                    const session = await this.login.redeemCode(body.code);
                    if (!session) {
                        return status(404, "Login code does not match");
                    }

                    cookie["itam-edu-token"]?.set({
                        value: session.token,
                        expires: session.expires,
                        sameSite: "lax",
                        path: "/"
                    });
                    return status(201, {
                        token: session.token,
                        expires: session.expires
                    });
                },
                {
                    body: t.Object({
                        code: t.String({ minLength: 0, maxLength: 128 })
                    }),
                    detail: {
                        summary: "Authenticate user",
                        description:
                            "Authenticates user and creates a new session.",
                        security: NO_AUTHENTICATION
                    }
                }
            )
            .delete(
                "/sessions/current",
                async ({ session, cookie }) => {
                    cookie["itam-edu-token"]?.remove();
                    await this.sessionRepo.remove(session.id);
                },
                {
                    requireAuthentication: true,
                    detail: {
                        summary: "Delete current session",
                        description:
                            "Deletes current user session and removes token cookie.",
                        security: REQUIRE_TOKEN
                    }
                }
            )
            .get(
                "/me/calendar",
                async ({ user, query }) => {
                    const filters: CalendarFilters = {
                        after: query.after ? new Date(query.after) : undefined,
                        before: query.before
                            ? new Date(query.before)
                            : undefined
                    };
                    const events = await this.calendarQuery.get(user, filters);
                    return events;
                },
                {
                    requireAuthentication: true,
                    detail: {
                        summary: "Get current user calendar",
                        description:
                            "Returns calendar events of the current user.",
                        security: REQUIRE_TOKEN
                    },
                    query: t.Partial(
                        t.Object({
                            after: t.String({ format: "date-time" }),
                            before: t.String({ format: "date-time" })
                        })
                    )
                }
            )
            .get(
                "/me/notifications",
                async ({ user }) => {
                    const notifications =
                        await this.notificationsQuery.getAll(user);
                    return { notifications };
                },
                {
                    requireAuthentication: true,
                    detail: {
                        summary: "Get current user notifications",
                        description:
                            "Returns notifications entries of the current user.",
                        security: REQUIRE_TOKEN
                    }
                }
            );
    }
}
