import * as schema from "./schema";

/* Course lesson. */
export class Lesson {
    public constructor(
        /** Identifier of the lesson. */
        public id: string,
        /** Identifier of the course. */
        public courseId: string,
        /** Basic information of the lesson. */
        public info: LessonInfo,
        /** Content of the lesson. */
        public content: string | null,
        /** Homeworks added to the lesson. */
        public homeworks: string[],
        /** Time and location of the lesson. */
        public schedule: LessonSchedule | null
    ) {}
}

/** Basic information of the lesson. */
export type LessonInfo = {
    title: string;
    description: string | null;
    banner: string | null;
    video: string | null;
};

/** Time and location of the lesson. */
export type LessonSchedule = typeof schema.lessonSchedule.static;
