import { Repository } from "../../../db/repository";
import { schemaFields } from "../../../util";
import * as schema from "./schema";
import { error } from "elysia";

export default class HomeworkRepository extends Repository {
    public async review(
        reviewerId: string,
        courseId: string,
        submissionId: string,
        reviewInfo: typeof schema.reviewOfSubmission.static
    ) {
        if ((await this.isCourseStaff(courseId, reviewerId)) === false) {
            return error(404);
        }
        await this.getSubmissionById(reviewerId, courseId, submissionId);

        const newSubmission = this.db
            .updateTable("homeworkSubmissions")
            .set({
                reviewerId: reviewerId,
                reviewAccepted: reviewInfo.reviewAccepted,
                reviewerComment: reviewInfo.reviewerComment
            })
            .where("id", "=", submissionId)
            .executeTakeFirstOrThrow();
        return newSubmission;
    }

    public async createSubmission(
        studentId: string,
        courseId: string,
        submissionInfo: typeof schema.createSubmission.static
    ) {
        if ((await this.isCourseStudent(courseId, studentId)) === false) {
            return error(404);
        }

        let current_attempt = 0;
        const existingSubmission = await this.getSubmission(
            studentId,
            submissionInfo.homeworkId
        );
        if (existingSubmission) {
            current_attempt = existingSubmission.attempt;
        }

        const newSubmission = this.db
            .insertInto("homeworkSubmissions")
            .values({
                studentId: studentId,
                homeworkId: submissionInfo.homeworkId,
                attempt: current_attempt + 1,
                solution: submissionInfo.solution,
                studentComment: submissionInfo.studentComment,
                submittedAt: new Date().toISOString()
            })
            .returningAll()
            .executeTakeFirst();
        return newSubmission;
    }

    public async getSubmissionById(
        userId: string,
        courseId: string,
        submissionId: string
    ) {
        const submission = await this.db
            .selectFrom("homeworkSubmissions")
            .selectAll()
            .where("id", "=", submissionId)
            .executeTakeFirst();
        if (!submission) {
            return error(404);
        }
        if (
            (await this.isCourseStaff(courseId, userId)) === false &&
            (submission.studentId !== userId ||
                (await this.isCourseStudent(courseId, userId)) === false)
        ) {
            return error(404);
        }
        return submission;
    }

    public async getSubmissions(
        userId: string,
        courseId: string,
        query: {
            reviewed?: boolean | null;
            homework?: string;
            student?: string;
        }
    ) {
        let submissions = this.db.selectFrom("homeworkSubmissions").selectAll();
        if ((await this.isCourseStaff(courseId, userId)) === false) {
            if ((await this.isCourseStudent(courseId, userId)) == false) {
                return error(404);
            }
            submissions = this.db
                .selectFrom("homeworkSubmissions")
                .selectAll()
                .where("studentId", "=", userId);
        }

        if (query.reviewed !== undefined) {
            submissions = submissions.where(
                "reviewAccepted",
                "=",
                query.reviewed
            );
        }
        if (query.homework !== undefined) {
            submissions = submissions.where("homeworkId", "=", query.homework);
        }
        if (query.student !== undefined) {
            submissions = submissions.where("studentId", "=", query.student);
        }
        return await submissions.execute();
    }

    public async getAllHomeworks(userId: string, courseId: string) {
        if (
            (await this.isCourseStaff(courseId, userId)) === false &&
            (await this.isCourseStudent(courseId, userId)) === false
        ) {
            return error(404);
        }

        const homeworks = this.db
            .selectFrom("homeworks")
            .selectAll()
            .where("courseId", "=", courseId)
            .execute();
        return homeworks;
    }

    public async getHomework(
        userId: string,
        courseId: string,
        homeworkId: string
    ) {
        if (
            (await this.isCourseStaff(courseId, userId)) === false &&
            (await this.isCourseStudent(courseId, userId)) === false
        ) {
            return error(404);
        }
        const homework = await this.db
            .selectFrom("homeworks")
            .selectAll()
            .where("id", "=", homeworkId)
            .executeTakeFirst();

        if (!homework) {
            return error(404);
        }
        return homework;
    }

    public async createHomework(
        userId: string,
        courseId: string,
        homeworkInfo: typeof schema.createHomework.static
    ) {
        if ((await this.isCourseStaff(courseId, userId)) === false) {
            return error(404);
        }
        const newHomework = await this.db
            .insertInto("homeworks")
            .values({
                title: homeworkInfo.title,
                solutionPlaceholder: homeworkInfo.solutionPlaceholder,
                content: homeworkInfo.content,
                courseId: courseId
            })
            .returningAll()
            .executeTakeFirstOrThrow();
        return newHomework;
    }

    public async updateHomework(
        userId: string,
        courseId: string,
        homeworkId: string,
        homeworkInfo: typeof schema.updateHomework.static
    ) {
        if ((await this.isCourseStaff(courseId, userId)) === false) {
            return error(404);
        }
        await this.getHomework(userId, courseId, homeworkId);
        const newHomework = await this.db
            .updateTable("homeworks")
            .where("id", "=", homeworkId)
            .set({
                title: homeworkInfo.title,
                content: homeworkInfo.content,
                solutionPlaceholder: homeworkInfo.solutionPlaceholder
            })
            .returning(schemaFields(schema.homework))
            .executeTakeFirst();

        return newHomework ?? null;
    }

    public async getSubmission(studentId: string, homeworkId: string) {
        const submission = await this.db
            .selectFrom("homeworkSubmissions")
            .selectAll()
            .where("studentId", "=", studentId)
            .where("homeworkId", "=", homeworkId)
            .orderBy("attempt", "desc")
            .executeTakeFirst();
        return submission;
    }

    public async isCourseStudent(courseId: string, studentId: string) {
        const student = this.db
            .selectFrom("courseStudents")
            .selectAll()
            .where("courseId", "=", courseId)
            .where("userId", "=", studentId)
            .execute();
        return (await student).length === 1;
    }

    public async isCourseStaff(courseId: string, userId: string) {
        const staff = this.db
            .selectFrom("courseStaff")
            .selectAll()
            .where("courseId", "=", courseId)
            .where("userId", "=", userId)
            .execute();
        return (await staff).length === 1;
    }
}
