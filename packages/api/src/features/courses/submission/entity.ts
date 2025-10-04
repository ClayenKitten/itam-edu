/** Homework submission. */
export class Submission {
    public constructor(
        public readonly homeworkId: string,
        public readonly studentId: string,
        public readonly attempts: SubmissionAttempt[]
    ) {}

    public get accepted(): boolean | null {
        return this.attempts[0]!.review?.accepted ?? null;
    }

    public get lastAttempt(): SubmissionAttempt {
        return this.attempts[0]!;
    }
}

export type SubmissionAttempt = {
    /** Identifier of the submission attempt. */
    id: string;
    /** HTML content */
    content: string | null;
    /** List of attached files. */
    files: string[];
    /** Review of submission, if  */
    review: SubmissionAttemptReview | null;
    /** Date when submission was sent. */
    sentAt: Date;
};

export type SubmissionAttemptReview = {
    /** Whether submission was accepted or not. */
    accepted: boolean;
    /** HTML content. */
    content: string | null;
    /** List of attached files. */
    files: string[];
    /** Person who reviewed the submission. May be null for automated reviews. */
    reviewerId: string | null;
    /** Date when submission review was sent. */
    sentAt: Date;
};
