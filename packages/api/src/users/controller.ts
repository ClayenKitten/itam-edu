import { injectable } from "inversify";
import { Elysia, t } from "elysia";
import { NO_AUTHENTICATION, REQUIRE_TOKEN } from "../api/plugins/docs";
import { AuthenticationPlugin } from "../api/plugins/authenticate";
import { UserRepository } from "./repository";
import { Session, SessionRepository } from "./session";
import { LoginCodeRepository } from "./login";
import { CalendarQuery, type CalendarFilters } from "./calendar";
import { NotificationSender } from "../notifications/sender";
import { LoginNotificationTemplate } from "./notifications";
import { Redis } from "../infra/redis";
import * as schema from "./schema";

@injectable()
export class UserController {
    public constructor(
        protected authPlugin: AuthenticationPlugin,
        protected userRepo: UserRepository,
        protected sessionRepo: SessionRepository,
        protected loginCodeRepo: LoginCodeRepository,
        protected calendarQuery: CalendarQuery,
        protected notificationSender: NotificationSender,
        protected redis: Redis
    ) {}

    public toElysia() {
        return new Elysia({ prefix: "/users", tags: ["Users"] })
            .use(this.authPlugin.toElysia())
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
                    const user = await this.loginCodeRepo.pop(body.code);
                    if (!user) return status(404, "Login code does not match");

                    const session = Session.create(user);
                    await this.sessionRepo.add(session);

                    await this.notificationSender.send(
                        new LoginNotificationTemplate(),
                        [user.id]
                    );
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
                    const stream = await this.redis.pool.xRange(
                        `notifications:${user.id}`,
                        "-",
                        "+"
                    );
                    const notifications = stream.map(({ message }) =>
                        JSON.parse(message.payload!)
                    );
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
