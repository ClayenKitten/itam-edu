import { injectable } from "inversify";
import { AttendanceDao } from "../dao";
import type { User } from "itam-edu-common";
import { CourseRepository } from "../../../repository";
import {
    BadRequestError,
    ForbiddenError,
    NotFoundError,
    type HttpError
} from "../../../../api/errors";
import { LessonRepository } from "../../repository";
import { AttendanceTokenService } from "./service";

@injectable()
export class ApplyAttendanceToken {
    public constructor(
        private dao: AttendanceDao,
        private courseRepo: CourseRepository,
        private lessonRepo: LessonRepository,
        private tokenService: AttendanceTokenService
    ) {}

    public async invoke(actor: User, token: string): Promise<void | HttpError> {
        const payload = await this.tokenService.verify(token);
        if (!payload) {
            return new BadRequestError("Failed to verify provided token.");
        }
        const { courseId, lessonId } = payload;

        const course = await this.courseRepo.getById(courseId);
        const permissions = course?.getPermissionsFor(actor);
        if (!course || !permissions) {
            return new NotFoundError("Course does not exist.");
        }
        if (!actor.isCourseStudent(course.id)) {
            return new ForbiddenError("You are not a course student.");
        }
        const lesson = await this.lessonRepo.load(courseId, lessonId);
        if (!lesson) {
            return new NotFoundError("Lesson not found.");
        }

        await this.dao.add(lesson, actor, "offline");
    }
}
