import { Elysia, t } from "elysia";
import * as schema from "./schema";
import type { AppContext } from "../ctx";
import { REQUIRE_TOKEN } from "../api/plugins/docs";
import { authenticationPlugin } from "../api/plugins/authenticate";

export async function courseController(ctx: AppContext) {
    return new Elysia({ prefix: "/courses", tags: ["Courses"] })
        .derive(() => ctx)
        .use(authenticationPlugin(ctx))
        .get(
            "",
            async ({ db }) => {
                const courses = await db.course.getAll();
                return courses.map(c => c.toDTO());
            },
            {
                detail: {
                    summary: "List courses",
                    description: "Returns all courses"
                }
            }
        )
        .post(
            "",
            async ({ db, body, error }) => {
                const course = await db.course.create(body);
                if (!course) return error(400, "Couldn't create course");
                return course.toDTO();
            },
            {
                hasPermission: ["canCreateCourses"],
                body: schema.createCourse,
                detail: {
                    summary: "Create new course",
                    description: "Creates new course.",
                    security: REQUIRE_TOKEN
                }
            }
        )
        .get(
            "/lookup/:slug",
            async ({ db, params, query, error }) => {
                const course = await db.course.getBySlug(
                    params.slug,
                    query.year,
                    query.semester
                );
                if (!course) return error(404);
                return course.toDTO();
            },
            {
                query: t.Partial(
                    t.Object({
                        year: t.Integer(),
                        semester: t.Integer()
                    })
                ),
                params: t.Object({
                    slug: schema.course.properties.slug
                }),
                detail: {
                    summary: "Lookup course id",
                    description:
                        "Returns course id by human-readable identifier."
                }
            }
        )
        .group(
            "/:course",
            {
                params: t.Object(
                    { course: t.String({ format: "uuid" }) },
                    { additionalProperties: true }
                )
            },
            app =>
                app
                    .get(
                        "",
                        async ({ db, params, error }) => {
                            const course = await db.course.getById(
                                params.course
                            );
                            if (!course) return error(404);
                            return course.toDTO();
                        },
                        {
                            detail: {
                                summary: "Get course",
                                description: "Returns course."
                            }
                        }
                    )
                    .patch(
                        "",
                        async ({ db, params, body, error }) => {
                            const course = await db.course.update(
                                params.course,
                                body
                            );
                            if (!course) return error(404);
                            return course.toDTO();
                        },
                        {
                            body: schema.updateCourse,
                            hasCoursePermission: "canEditInfo",
                            detail: {
                                summary: "Update course",
                                description: "Updates course.",
                                security: REQUIRE_TOKEN
                            }
                        }
                    )
        );
}
