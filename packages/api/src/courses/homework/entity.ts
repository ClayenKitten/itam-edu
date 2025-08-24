import * as schema from "./schema";

/* Course homework. */
export default class Homework {
    public constructor(
        /** Identifier of the homework. */
        public id: string,
        /** Identifier of the course. */
        public course: string,
        /** Title of the homework. */
        public title: string,
        /** Content of the homework. */
        public content: string | null,
        /** Deadline after which homework can't be submitted. */
        public deadline: Date | null,
        /** If set, overrides automatic submission management. */
        public deadlineOverride: boolean | null,
        /** Date when homework was created. */
        public createdAt: Date
    ) {}

    /**
     * Determines whether the homework is currently accepting submissions.
     *
     * Homework submission is open if it has no deadline or the deadline hasn't passed yet.
     *
     * Default behaviour may be overridden by {@link deadlineOverride} flag.
     */
    public get isSubmissionOpen(): boolean {
        if (this.deadlineOverride !== null) {
            return this.deadlineOverride;
        }
        if (this.deadline === null) {
            return true;
        }
        return Date.now() <= this.deadline.getTime();
    }

    public toDTO(): typeof schema.homework.static {
        return {
            id: this.id,
            courseId: this.course,
            title: this.title,
            content: this.content,
            deadline: this.deadline,
            deadlineOverride: this.deadlineOverride,
            createdAt: this.createdAt
        };
    }
}
