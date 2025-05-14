export type CalendarEvent = {
    id: string;
    title: string;
    datetime: Date;
    courseId: string;
} & ({ kind: "lesson" } | { kind: "homework" });
