import { Hono } from "hono";
import type { AppEnv } from "../../ctx.js";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { updateCourseSchema } from "./schema.js";
import authorize from "../../middlewares/authorize.js";
import { lessonController } from "./lesson/controller.js";
import { studentController } from "./student/controller.js";

export async function courseController() {
    return new Hono<AppEnv>()
        .route("/", await lessonController())
        .route("/", await studentController())
        .get("/", async c => {
            const courses = await c.var.repo.course.getAll();
            return c.json(courses, 200);
        })
        .get(
            "/lookup/:year/:semester/:courseSlug",
            zValidator(
                "param",
                z.object({
                    year: z.string().regex(/^\d+$/),
                    semester: z.enum(["1", "2", "null"]),
                    courseSlug: z.string().regex(/^[a-z\d-]{3,}$/)
                })
            ),
            async c => {
                const { year, semester, courseSlug } = c.req.valid("param");
                const course = await c.var.repo.course.lookup({
                    year: Number(year),
                    semester: semester !== "null" ? Number(semester) : null,
                    courseSlug
                });
                if (!course) return c.text("Not Found", 404);
                c.header("Cache-Control", "max-age=1800");
                return c.json(course, 200);
            }
        )
        .get(
            "/:course",
            zValidator("param", z.object({ course: z.string().uuid() })),
            async c => {
                const course = await c.var.repo.course.get(
                    c.req.param("course")
                );
                if (!course) return c.text("Not Found", 404);
                return c.json(course, 200);
            }
        )
        .put(
            "/:course",
            zValidator("param", z.object({ course: z.string().uuid() })),
            zValidator("json", updateCourseSchema),
            authorize(
                (p, c) =>
                    p.course.get(c.req.param("course"))?.canEditInfo === true
            ),
            async c => {
                const found = await c.var.repo.course.update(
                    c.req.valid("param").course,
                    c.req.valid("json")
                );
                if (!found) return c.text("Not Found", 404);
                return c.json({ success: found }, 200);
            }
        );
}
