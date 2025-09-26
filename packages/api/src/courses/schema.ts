import { t } from "elysia";

/** Course data. */
export const course = t.Object({
    id: t.String({ format: "uuid" }),
    slug: t.String({
        minLength: 3,
        maxLength: 24,
        pattern: "^[a-z0-9-]+$"
    }),
    year: t.Integer({ minimum: 2000, maximum: 3000 }),
    semester: t.Union([t.Literal("autumn"), t.Literal("spring")]),
    ownerId: t.String({ format: "uuid" }),

    title: t.String({ minLength: 1, maxLength: 32 }),
    description: t.Nullable(t.String({ maxLength: 500 })),
    status: t.Nullable(t.String({ maxLength: 300 })),
    cover: t.Nullable(t.String({ maxLength: 300 })),
    icon: t.Nullable(t.String({ maxLength: 300 })),
    banner: t.Nullable(t.String({ maxLength: 300 })),
    about: t.String({ maxLength: 32768 }),
    theme: t.String({ pattern: "^[a-z]+$" }),

    isPublished: t.Boolean(),
    isEnrollmentOpen: t.Boolean(),
    isArchived: t.Boolean()
});
export type CourseDto = typeof course.static;

/** Data to create course. */
export const createCourse = t.Pick(course, [
    "slug",
    "year",
    "semester",
    "title",
    "ownerId"
]);
export type CreateCourseDto = typeof createCourse.static;

/** Data to modify a course. */
export const updateCourse = t.Partial(
    t.Pick(course, [
        "title",
        "description",
        "status",
        "cover",
        "icon",
        "banner",
        "about",
        "theme",
        "isPublished",
        "isEnrollmentOpen",
        "isArchived"
    ])
);
export type UpdateCourseDto = typeof updateCourse.static;
