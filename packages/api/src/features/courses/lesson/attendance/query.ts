import { injectable } from "inversify";
import { Postgres } from "../../../../infra/postgres";
import type { User } from "itam-edu-common";
import {
    ForbiddenError,
    NotFoundError,
    type HttpError
} from "../../../../api/errors";
import { CourseRepository } from "../../repository";
import { sql } from "kysely";

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

        let attendeesQuery = this.postgres.kysely
            .selectFrom("lessonAttendees as la")
            .innerJoin("lessons", "lessons.id", "la.lessonId")
            .where("lessons.courseId", "=", courseId)
            .select([
                "la.lessonId",
                "la.userId",
                "la.format",
                "la.recordedAt",
                "la.manuallyAddedBy"
            ]);

        let callQuery = this.postgres.kysely
            .selectFrom("callParticipants as ca")
            .innerJoin("lessons", "lessons.id", "ca.callId")
            .where("lessons.courseId", "=", courseId)
            .innerJoin("userCourses", join =>
                join
                    .onRef("userCourses.userId", "=", "ca.userId")
                    .onRef("userCourses.courseId", "=", "lessons.courseId")
            )
            .where("userCourses.role", "=", "student")
            .leftJoin("lessonAttendees as la", join =>
                join
                    .onRef("la.lessonId", "=", "ca.callId")
                    .onRef("la.userId", "=", "ca.userId")
            )
            .where("la.userId", "is", null)
            .select([
                "ca.callId as lessonId",
                "ca.userId",
                sql.lit<"online">("online").as("format"),
                "ca.firstJoinedAt as recordedAt",
                sql.lit(null).as("manuallyAddedBy")
            ]);

        if (lessonId) {
            attendeesQuery = attendeesQuery.where("la.lessonId", "=", lessonId);
            callQuery = callQuery.where("ca.callId", "=", lessonId);
        }

        const rows: AttendeeDto[] = await attendeesQuery
            .unionAll(callQuery)
            .execute();

        return rows;
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
