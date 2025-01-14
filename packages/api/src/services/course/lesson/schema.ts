import { z } from "zod";

export const lesson = z.object({
    courseId: z.string().uuid(),
    title: z.string().min(3).max(200),
    slug: z.string().regex(/^[a-z][a-z0-9-]*$/),
    position: z.number().int(),
    content: z.string().nullable()
});

export const updateLesson = lesson.pick({
    title: true,
    position: true,
    content: true
});

export const createLesson = lesson.pick({
    title: true,
    slug: true
});
