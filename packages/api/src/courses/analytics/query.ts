import { injectable } from "inversify";
import { StudentCounter, type SeriesValue } from "./student-counter";
import type { User } from "itam-edu-common";
import { CourseRepository } from "../repository";
import { ForbiddenError, HttpError, NotFoundError } from "../../api/errors";

@injectable()
export class CourseStatisticsQuery {
    public constructor(
        private courseRepo: CourseRepository,
        private studentCounter: StudentCounter
    ) {}

    public async get(
        actor: User,
        courseId: string
    ): Promise<CourseStatistics | HttpError> {
        const course = await this.courseRepo.getById(courseId);
        const permissions = course?.getPermissionsFor(actor);
        if (!course || !permissions) {
            return new NotFoundError("Course not found.");
        }
        if (permissions.analytics.view !== true) {
            return new ForbiddenError(
                "You are not allowed to view course analytics."
            );
        }

        const students = await this.studentCounter.get(courseId);
        return { students };
    }
}

export type CourseStatistics = {
    students: SeriesValue[];
};
