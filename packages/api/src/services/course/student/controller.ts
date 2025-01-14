import { Hono } from "hono";
import type { AppEnv } from "../../../ctx.js";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import authorize from "../../../middlewares/authorize.js";

export async function studentController() {
    return new Hono<AppEnv>().basePath("/:course/students").get(
        "/",
        zValidator("param", z.object({ course: z.string().uuid() })),
        authorize(c => c.user.isStaff),
        async c => {
            const students = await c.var.repo.student.getAll(
                c.req.param("course")
            );
            return c.json(students, 200);
        }
    );
}
