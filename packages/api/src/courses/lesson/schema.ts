import { t } from "elysia";

export const lessonInfo = t.Object({
    title: t.String({ minLength: 3, maxLength: 80 }),
    description: t.Nullable(t.String({ maxLength: 1000 })),
    banner: t.Nullable(t.String({ format: "uri", maxLength: 1000 })),
    position: t.Number({ multipleOf: 1 }),
    createdAt: t.Date()
});

export const lessonContent = t.Object({
    /** HTML content of the lesson. */
    body: t.Nullable(t.String()),
    /** Homeworks that are added to that lesson. */
    homeworks: t.Nullable(
        t.Array(t.String({ format: "uuid" }), { maxItems: 10 })
    )
});

export const lessonSchedule = t.Object({
    /** Date of the lesson. */
    date: t.Date(),
    /** Online lesson properties. */
    online: t.Nullable(t.Object({})),
    /** Whether lesson will take place offline. */
    offline: t.Nullable(
        t.Object({
            /** Physical location of the lesson. */
            location: t.Nullable(t.String({ maxLength: 30 }))
        })
    )
});

export const lesson = t.Object({
    id: t.String({ format: "uuid" }),
    courseId: t.String({ format: "uuid" }),
    info: lessonInfo,
    content: lessonContent,
    schedule: t.Nullable(lessonSchedule)
});
export const lessonWithoutContent = t.Omit(lesson, ["content"]);
export const updateLesson = t.Pick(lesson, ["title", "content"]);
export const updateLessonPositions = t.Array(t.String(), { minItems: 1 });
export const createLesson = t.Object({
    title: lessonInfo.properties.title,
    schedule: t.Nullable(lessonSchedule)
});
