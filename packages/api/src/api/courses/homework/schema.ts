import { t } from "elysia";

export const homework = t.Object({
    id: t.String({ format: "uuid" }),
    courseId: t.String({ format: "uuid" }),
    title: t.String(),
    content: t.String(),
    solutionPlaceholder: t.Nullable(t.String())
});

export const createHomework = t.Omit(homework, ["id", "courseId"]);
export const updateHomework = t.Omit(homework, ["id", "courseId"]);

export const homeworkSubmission = t.Object({
    id: t.String({ format: "uuid" }),
    studentId: t.String({ format: "uuid" }),
    homeworkId: t.String({ format: "uuid" }),
    attempt: t.Integer(),
    solution: t.String(),
    studentComment: t.Nullable(t.String()),
    submittedAt: t.Nullable(t.Date()),
    reviewAccepted: t.Nullable(t.Boolean()),
    reviewerId: t.Nullable(t.String({ format: "uuid" })),
    reviewerComment: t.Nullable(t.String()),
    reviewedAt: t.Nullable(t.Date())
});

export const reviewOfSubmission = t.Pick(homeworkSubmission, [
    "reviewAccepted",
    "reviewerComment"
]);

export const createSubmission = t.Pick(homeworkSubmission, [
    "homeworkId",
    "solution",
    "studentComment"
]);
