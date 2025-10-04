import { injectable } from "inversify";
import type { User } from "itam-edu-common";
import { CourseRepository } from "../../../repository";
import {
    ForbiddenError,
    NotFoundError,
    type HttpError
} from "../../../../../api/errors";
import { LessonRepository } from "../../repository";
import { AttendanceTokenService } from "./service";

@injectable()
export class CreateAttendanceToken {
    public constructor(
        private courseRepo: CourseRepository,
        private lessonRepo: LessonRepository,
        private tokenService: AttendanceTokenService
    ) {}

    public async invoke(
        actor: User,
        courseId: string,
        lessonId: string
    ): Promise<string | HttpError> {
        const course = await this.courseRepo.getById(courseId);
        const permissions = course?.getPermissionsFor(actor);
        if (!course || !permissions) {
            return new NotFoundError("Course does not exist.");
        }
        if (!permissions.attendance.edit) {
            return new ForbiddenError(
                "You are not allowed to generate attendance token."
            );
        }
        const lesson = await this.lessonRepo.load(courseId, lessonId);
        if (!lesson) {
            return new NotFoundError("Lesson not found.");
        }

        return await this.tokenService.create({ courseId, lessonId });
    }
}
