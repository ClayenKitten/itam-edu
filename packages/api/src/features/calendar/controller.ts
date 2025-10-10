import { injectable } from "inversify";
import { Elysia, t } from "elysia";
import { REQUIRE_TOKEN } from "../../ports/http/openapi";
import { AuthenticationPlugin } from "../../ports/http/authn";
import { CalendarQuery } from "./query";
import type { CalendarFilters } from "./query";

@injectable()
export class CalendarController {
    public constructor(
        private authPlugin: AuthenticationPlugin,
        private calendarQuery: CalendarQuery
    ) {}

    public toElysia() {
        return new Elysia({ prefix: "/calendar", tags: ["Calendar"] })
            .use(this.authPlugin.toElysia())

            .get(
                "",
                async ({ user, query }) => {
                    const filters: CalendarFilters = {
                        after: query.after ? new Date(query.after) : undefined,
                        before: query.before
                            ? new Date(query.before)
                            : undefined,
                        kind: query.kind,
                        course: query.course
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
                            kind: t.Array(
                                t.Enum({
                                    lesson: "lesson",
                                    homework: "homework"
                                })
                            ),
                            course: t.Array(t.String({ format: "uuid" })),
                            after: t.String({ format: "date-time" }),
                            before: t.String({ format: "date-time" })
                        })
                    )
                }
            );
    }
}
