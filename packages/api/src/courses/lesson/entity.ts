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
        public content: LessonContent,
        /** Time and location of the lesson. */
        public schedule: LessonSchedule | null
    ) {}

    public toDTO(): typeof schema.lesson.static {
        return {
            id: this.id,
            courseId: this.courseId,
            info: this.info,
            content: this.content,
            schedule: this.schedule
        };
    }
}

/** Basic information of the lesson. */
export type LessonInfo = typeof schema.lessonInfo.static;

/** Content of the lesson. */
export type LessonContent = typeof schema.lessonContent.static;

/** Time and location of the lesson. */
export type LessonSchedule = typeof schema.lessonSchedule.static;
