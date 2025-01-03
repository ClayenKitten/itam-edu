import { Hono } from "hono";
import type { AppEnv } from "../index.js";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

export async function courseService() {
    return new Hono<AppEnv>()
        .get("/", async c => {
            const courses = await c.var.db
                .selectFrom("courses")
                .selectAll()
                .execute();
            return c.json(courses);
        })
        .get(
            "/lookup/:year/:semester/:courseSlug",
            zValidator(
                "param",
                z.object({
                    year: z.string().regex(/^\d+$/),
                    semester: z.union([
                        z.literal("1"),
                        z.literal("2"),
                        z.literal("null")
                    ]),
                    courseSlug: z.string().regex(/^[a-z\d-]{3,}$/)
                }),
                (result, c) => {
                    if (!result.success) return c.text("Not Found", 404);
                }
            ),
            async c => {
                let query = c.var.db
                    .selectFrom("courses")
                    .select("id")
                    .where("year", "=", Number(c.req.param("year")))
                    .where("slug", "=", c.req.param("courseSlug"));
                if (c.req.param("semester") !== "null") {
                    query = query.where(
                        "semester",
                        "=",
                        Number(c.req.param("semester"))
                    );
                } else {
                    query = query.where("semester", "is", null);
                }

                const course = await query.executeTakeFirst();
                if (course) {
                    c.header("Cache-Control", "max-age=1800");
                    return c.json(course);
                } else return c.json("not found", 404);
            }
        )
        .get(
            "/:course",
            zValidator("param", z.object({ course: z.string().uuid() })),
            async c => {
                const course = await c.var.db
                    .selectFrom("courses")
                    .selectAll()
                    .where("id", "=", c.req.param("course"))
                    .executeTakeFirst();
                if (course) return c.json(course);
                else return c.json("not found", 404);
            }
        )
        .get(
            "/:course/lessons",
            zValidator("param", z.object({ course: z.string().uuid() })),
            async c => {
                const lessons = await c.var.db
                    .selectFrom("lessons")
                    .select([
                        "id",
                        "courseId",
                        "slug",
                        "parentId",
                        "position",
                        "icon",
                        "title"
                    ])
                    .where("courseId", "=", c.req.param("course"))
                    .orderBy("position asc")
                    .execute();
                return c.json(lessons);
            }
        )
        .get(
            "/:course/lessons/:lesson",
            zValidator(
                "param",
                z.object({
                    course: z.string().uuid(),
                    lesson: z.string().uuid()
                })
            ),
            async c => {
                const lesson = await c.var.db
                    .selectFrom("lessons")
                    .selectAll()
                    .where("courseId", "=", c.req.param("course"))
                    .where("id", "=", c.req.param("lesson"))
                    .orderBy("position asc")
                    .executeTakeFirst();
                if (lesson) return c.json(lesson);
                else return c.json("not found", 404);
            }
        )
        .get(
            "/:course/lessons/lookup/:lessonSlug",
            zValidator(
                "param",
                z.object({ course: z.string().uuid(), lessonSlug: z.string() }),
                (result, c) => {
                    if (!result.success) return c.text("Not Found", 404);
                }
            ),
            async c => {
                const lesson = await c.var.db
                    .selectFrom("lessons")
                    .select("id")
                    .where("courseId", "=", c.req.param("course"))
                    .where("slug", "=", c.req.param("lessonSlug"))
                    .executeTakeFirst();
                if (lesson) return c.json(lesson);
                else return c.json("not found", 404);
            }
        );
}
