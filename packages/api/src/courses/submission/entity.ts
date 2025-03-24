import * as schema from "./schema";

/** Homework submission. */
export default class Submission {
    public constructor(
        public id: string,
        public info: SubmissionInfo,
        public review: Review | null
    ) {}

    public toDTO(): typeof schema.submission.static {
        return {
            id: this.id,
            ...this.info,
            review: this.review
        };
    }
}

/** Submission information. */
export type SubmissionInfo = {
    solution: string;
    homework: string;
    student: string;
    comment: string | null;
    submittedAt: Date;
};

/** Review of the homework submission. */
export type Review = typeof schema.submissionReview.static;
