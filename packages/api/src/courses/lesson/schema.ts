import { t } from "elysia";

export const lessonInfo = t.Object({
    title: t.String({ minLength: 3, maxLength: 80 }),
    description: t.Nullable(t.String({ maxLength: 1000 })),
    banner: t.Nullable(t.String({ minLength: 1 })),
    video: t.Nullable(t.String({ minLength: 1 }))
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
            location: t.Nullable(t.String({ maxLength: 60 }))
        })
    )
});

export const createLesson = t.Object({
    info: lessonInfo,
    content: t.Nullable(t.String()),
    homeworks: t.Array(t.String({ format: "uuid" }), { maxItems: 10 }),
    schedule: t.Nullable(lessonSchedule)
});

export const updateLesson = t.Partial(createLesson);

export const reorderLessonsList = t.Array(t.String({ format: "uuid" }));
