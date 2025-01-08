import { z } from "zod";

export const courseSchema = z.object({
    id: z.string().uuid(),
    slug: z.string().min(3).max(12),
    year: z.number().int().min(2000).max(3000),
    semester: z.number().int().nullable(),

    title: z.string().min(3).max(200),
    description: z.string().max(1000).nullable(),
    logo: z.string().max(1000).url().nullable(),

    blogEnabled: z.boolean(),
    feedbackEnabled: z.boolean(),
    public: z.boolean(),
    enrollmentOpen: z.boolean(),
    archived: z.boolean()
});

export const updateCourseSchema = courseSchema
    .omit({
        id: true,
        slug: true,
        year: true,
        semester: true
    })
    .partial();

export const lessonSchema = z.object({
    courseId: z.string().uuid(),
    title: z.string().min(3).max(200),
    slug: z.string().regex(/^[a-z][a-z0-9-]*$/),
    position: z.number().int(),
    content: z.string().nullable()
});

export const createLessonSchema = lessonSchema.pick({
    title: true,
    slug: true
});
