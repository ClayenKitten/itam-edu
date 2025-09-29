import { t } from "elysia";

const title = t.String({ minLength: 3, maxLength: 80 });
const description = t.Nullable(t.String({ maxLength: 1000 }));
const content = t.Nullable(t.String());
const banner = t.Nullable(t.String({ minLength: 1 }));
const video = t.Nullable(t.String({ minLength: 1 }));
const homeworkIds = t.Array(t.String({ format: "uuid" }), { maxItems: 10 });

export const lessonSchedule = t.Object({
    /** Date of the lesson. */
    date: t.Date(),
    /** Physical location of the lesson. */
    location: t.Nullable(t.String({ maxLength: 60 })),
    isOnline: t.Boolean()
});

export const createLesson = t.Object({
    title,
    description,
    content,
    homeworkIds,
    schedule: t.Nullable(lessonSchedule)
});

export const updateLesson = t.Partial(
    t.Object({
        title,
        description,
        content,
        banner,
        video,
        homeworkIds,
        schedule: t.Nullable(lessonSchedule)
    })
);

export const reorderLessonsList = t.Array(t.String({ format: "uuid" }));
