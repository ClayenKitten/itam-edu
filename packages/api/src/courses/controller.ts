import { Elysia, t } from "elysia";
import initContext from "../api/plugins";
import { lessonController } from "./lesson/controller";
import { studentController } from "./student/controller";
import * as schema from "./schema";
import { homeworkController } from "./homework/controller";
import { DEFAULT_SECURITY } from "../api/plugins/docs";

export async function courseController<PREFIX extends string>(prefix: PREFIX) {
    return new Elysia({ prefix, tags: ["Courses"] })
        .use(initContext())
        .use(lessonController("/:course/lessons"))
        .use(homeworkController("/:course/homeworks"))
        .use(studentController("/:course/students"))
        .get(
            "",
            async ({ db }) => {
                const courses = await db.course.getAll();
                return courses;
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
            async ({ db, body }) => {
                return await db.course.create(body);
            },
            {
                hasPermission: ["canCreateCourses"],
                body: schema.createCourse,
                detail: {
                    summary: "Create new course",
                    description: "Creates new course.",
                    security: DEFAULT_SECURITY
                }
            }
        )
        .get(
            "/lookup/:slug",
            async ({ db, params, query, error }) => {
                const course = await db.course.lookup(
                    params.slug,
                    query.year,
                    query.semester
                );
                if (!course) return error(404);
                return course;
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
                            const course = await db.course.get(params.course);
                            if (!course) return error(404);
                            return course;
                        },
                        {
                            detail: {
                                summary: "Get course",
                                description: "Returns course."
                            }
                        }
                    )
                    .put(
                        "",
                        async ({ db, params, body, error }) => {
                            const found = await db.course.update(
                                params.course,
                                body
                            );
                            if (!found) return error(404);
                            return { success: found };
                        },
                        {
                            body: schema.updateCourse,
                            hasCoursePermission: "canEditInfo",
                            detail: {
                                summary: "Update course",
                                description: "Updates course.",
                                security: DEFAULT_SECURITY
                            }
                        }
                    )
        );
}
