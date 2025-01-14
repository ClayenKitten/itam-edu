import { Hono } from "hono";
import type { AppEnv } from "../../../ctx.js";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import * as schema from "./schema.js";
import authorize from "../../../middlewares/authorize.js";

export async function lessonController() {
    return new Hono<AppEnv>()
        .basePath("/:course/lessons")
        .get(
            "/",
            zValidator("param", z.object({ course: z.string().uuid() })),
            async c => {
                const lessons = await c.var.repo.lesson.getAll(
                    c.req.param("course")
                );
                return c.json(lessons, 200);
            }
        )
        .post(
            "/",
            zValidator("param", z.object({ course: z.string().uuid() })),
            zValidator("json", schema.createLesson),
            authorize(
                (p, c) =>
                    p.course.get(c.req.param("course"))?.canEditContent === true
            ),
            async c => {
                const success = await c.var.repo.lesson.create(
                    c.req.valid("param").course,
                    c.req.valid("json")
                );
                return c.json(success, 200);
            }
        )
        .get(
            "/:lesson",
            zValidator(
                "param",
                z.object({
                    course: z.string().uuid(),
                    lesson: z.string()
                })
            ),
            async c => {
                const lesson = await c.var.repo.lesson.get(
                    c.req.param("course"),
                    c.req.param("lesson")
                );
                if (!lesson) return c.json("not found", 404);
                return c.json(lesson, 200);
            }
        );
}
