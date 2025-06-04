import { t } from "elysia";

/** Course information. */
export const course = t.Object({
    id: t.String({ format: "uuid" }),
    slug: t.String({
        minLength: 3,
        maxLength: 12,
        pattern: "^[a-z\\d-]+$"
    }),
    year: t.Integer({ minimum: 2000, maximum: 3000 }),
    semester: t.Nullable(t.Integer({ minimum: 1, maximum: 2 })),

    title: t.String({ minLength: 1, maxLength: 200 }),
    description: t.Nullable(t.String({ maxLength: 1000 })),
    status: t.Nullable(t.String({ maxLength: 300 })),
    banner: t.Nullable(t.String({ maxLength: 100 })),
    logo: t.Nullable(t.String({ maxLength: 100 })),
    about: t.String({ maxLength: 32768 }),
    theme: t.String({ pattern: "^[a-z]+$" }),

    isPublished: t.Boolean(),
    isEnrollmentOpen: t.Boolean(),
    isArchived: t.Boolean()
});

/** Information to create course. */
export const createCourse = t.Pick(course, [
    "slug",
    "year",
    "semester",
    "title"
]);
