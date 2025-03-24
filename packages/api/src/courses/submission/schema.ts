import { t } from "elysia";

export const submissionReview = t.Object({
    accepted: t.Boolean(),
    reviewer: t.String({ format: "uuid" }),
    comment: t.Nullable(t.String()),
    reviewedAt: t.Date()
});

export const submission = t.Object({
    id: t.String({ format: "uuid" }),
    student: t.String({ format: "uuid" }),
    homework: t.String({ format: "uuid" }),
    solution: t.String(),
    comment: t.Nullable(t.String()),
    submittedAt: t.Nullable(t.Date()),
    review: t.Nullable(submissionReview)
});

export const createSubmission = t.Pick(submission, [
    "homework",
    "solution",
    "comment"
]);

export const createSubmissionReview = t.Pick(submissionReview, [
    "accepted",
    "comment"
]);
