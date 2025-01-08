import { Hono } from "hono";
import type { AppEnv } from "../../ctx.js";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { updateCourseSchema } from "./schema.js";

export async function courseService() {
    return new Hono<AppEnv>()
        .get("/", async c => {
            const courses = await c.var.repo.course.getCourses();
            return c.json(courses);
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
                const course = await c.var.repo.course.lookupCourse({
                    year: Number(year),
                    semester: semester !== "null" ? Number(semester) : null,
                    courseSlug
                });
                if (!course) return c.text("Not Found", 404);
                c.header("Cache-Control", "max-age=1800");
                return c.json(course);
            }
        )
        .get(
            "/:course",
            zValidator("param", z.object({ course: z.string().uuid() })),
            async c => {
                const course = await c.var.repo.course.getCourse(
                    c.req.param("course")
                );
                if (!course) return c.text("Not Found", 404);
                return c.json(course);
            }
        )
        .put(
            "/:course",
            zValidator("param", z.object({ course: z.string().uuid() })),
            zValidator("json", updateCourseSchema),
            async c => {
                const found = await c.var.repo.course.updateCourse(
                    c.req.valid("param").course,
                    c.req.valid("json")
                );
                if (!found) return c.text("Not Found", 404);
                return c.json({ success: found });
            }
        )
        .get(
            "/:course/lessons",
            zValidator("param", z.object({ course: z.string().uuid() })),
            async c => {
                const lessons = await c.var.repo.course.getLessons(
                    c.req.param("course")
                );
                return c.json(lessons);
            }
        )
        .get(
            "/:course/lessons/:lesson",
            zValidator(
                "param",
                z.object({
                    course: z.string().uuid(),
                    lesson: z.string()
                })
            ),
            async c => {
                const lesson = await c.var.repo.course.getLesson(
                    c.req.param("course"),
                    c.req.param("lesson")
                );
                if (lesson) return c.json(lesson);
                return c.json("not found", 404);
            }
        )
        .get(
            "/:course/students",
            zValidator("param", z.object({ course: z.string().uuid() })),
            async c => {
                const students = await c.var.repo.course.getCourseStudents(
                    c.req.param("course")
                );
                return c.json(students);
            }
        );
}
