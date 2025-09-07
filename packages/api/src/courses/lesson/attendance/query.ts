import { injectable } from "inversify";
import { Postgres } from "../../../infra/postgres";
import type { User } from "itam-edu-common";
import {
    ForbiddenError,
    NotFoundError,
    type HttpError
} from "../../../api/errors";
import { CourseRepository } from "../../repository";

@injectable()
export class AttendanceQuery {
    public constructor(
        private postgres: Postgres,
        private courseRepo: CourseRepository
    ) {}

    public async get(
        actor: User,
        courseId: string,
        lessonId: string | null
    ): Promise<AttendeeDto[] | HttpError> {
        const course = await this.courseRepo.getById(courseId);
        const permissions = course?.getPermissionsFor(actor);
        if (!course || !permissions) {
            return new NotFoundError("Course does not exist.");
        }
        if (permissions.attendance.view !== true) {
            return new ForbiddenError(
                "You are not allowed to view attendance."
            );
        }

        let query = this.postgres.kysely
            .selectFrom("lessonAttendees")
            .select([
                "lessonId",
                "userId",
                "format",
                "recordedAt",
                "manuallyAddedBy"
            ]);
        if (lessonId) {
            query = query.where("lessonId", "=", lessonId);
        }

        return await query.execute();
    }
}

export type AttendeeDto = {
    lessonId: string;
    userId: string;
    format: AttendanceFormat;
    recordedAt: Date;
    manuallyAddedBy: string | null;
};

export type AttendanceFormat = "online" | "offline";
