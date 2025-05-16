import { injectable } from "inversify";
import { Elysia, t } from "elysia";
import { NO_AUTHENTICATION, REQUIRE_TOKEN } from "../api/plugins/docs";
import { authenticationPlugin } from "../api/plugins/authenticate";
import { AppConfig } from "../config";
import { UserRepository } from "./repository";
import { Session, SessionRepository } from "./session";
import { LoginCodeRepository } from "./login";
import { CalendarQuery, type CalendarFilters } from "./calendar";
import { NotificationService } from "../notifications/service";

@injectable()
export class UserController {
    public constructor(
        protected config: AppConfig,
        protected userRepo: UserRepository,
        protected sessionRepo: SessionRepository,
        protected loginCodeRepo: LoginCodeRepository,
        protected calendarQuery: CalendarQuery,
        protected notificationService: NotificationService
    ) {}

    public toElysia() {
        return new Elysia({ prefix: "/users", tags: ["Users"] })
            .use(authenticationPlugin(this.userRepo))
            .get(
                "/me",
                async ({ user }) => {
                    return {
                        user: {
                            id: user.id,
                            info: user.info,
                            telegram: user.telegram,
                            enrollments: user.enrollments,
                            permissions: user.permissions
                        }
                    };
                },
                {
                    requireAuthentication: true,
                    detail: {
                        summary: "Get current user information",
                        description:
                            "Returns information about the current user.",
                        security: REQUIRE_TOKEN
                    }
                }
            )
            .post(
                "/sessions",
                async ({ body, status }) => {
                    const loginCode = await this.loginCodeRepo.get(body.code);
                    if (!loginCode)
                        return status(404, "Login code does not match");
                    await this.loginCodeRepo.delete(loginCode);

                    const user = (await this.userRepo.getById(
                        loginCode.userId
                    ))!;
                    const session = Session.create(user);
                    await this.sessionRepo.add(session);

                    this.notificationService.send(
                        `<b>🔐 Новый вход в платформу ITAM Education</b>\n\nЭто не вы? Напишите @${this.config.tg.supportUsername}!`,
                        user ? [user.id] : []
                    );
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
            );
    }
}
