import { t } from "elysia";

/** Course information. */
export const course = t.Object({
    id: t.String({ format: "uuid" }),
    slug: t.String({
        minLength: 3,
        maxLength: 12,
        pattern: "^[a-z\\d-]+$",
        default: "my-lesson"
    }),
    year: t.Integer({ minimum: 2000, maximum: 3000 }),
    semester: t.Nullable(t.Integer({ minimum: 1, maximum: 2 })),

    title: t.String({ minLength: 1, maxLength: 200 }),
    description: t.Nullable(t.String({ maxLength: 1000 })),
    logo: t.Nullable(t.String({ format: "uri", maxLength: 1000 })),

    isPublished: t.Boolean(),
    isEnrollmentOpen: t.Boolean(),
    isArchived: t.Boolean(),
    isBlogEnabled: t.Boolean(),
    isFeedbackEnabled: t.Boolean()
});

/** Update course information. */
export const updateCourse = t.Partial(
    t.Omit(course, ["id", "slug", "year", "semester"])
);
