import { injectable } from "inversify";
import { AttendanceDao } from "../dao";
import type { User } from "itam-edu-common";
import { CourseRepository } from "../../../repository";
import { LessonRepository } from "../../repository";
import { AttendanceTokenService } from "./service";
import { AppError } from "../../../../../errors";
import {
    CourseNotFound,
    LessonNotFound,
    UserIsNotCourseStudent
} from "../../../errors";

@injectable()
export class ApplyAttendanceToken {
    public constructor(
        private dao: AttendanceDao,
        private courseRepo: CourseRepository,
        private lessonRepo: LessonRepository,
        private tokenService: AttendanceTokenService
    ) {}

    /**
     * Apply a provided attendance token.
     *
     * @throws {CourseNotFound}
     * @throws {LessonNotFound}
     * @throws {UserIsNotCourseStudent}
     * @throws {BadToken}
     */
    public async invoke(actor: User, token: string): Promise<void> {
        const payload = await this.tokenService.verify(token);
        if (!payload) {
            throw new BadToken(actor.id);
        }
        const { courseId, lessonId } = payload;

        const course = await this.courseRepo.getById(courseId);
        const permissions = course?.getPermissionsFor(actor);
        if (!course || !permissions) {
            throw new CourseNotFound(courseId);
        }
        if (!actor.isCourseStudent(course.id)) {
            throw new UserIsNotCourseStudent();
        }
        const lesson = await this.lessonRepo.load(courseId, lessonId);
        if (!lesson) {
            throw new LessonNotFound(lessonId);
        }
        await this.dao.add(lesson, actor, "offline");
    }
}

export class BadToken extends AppError {
    public constructor(actorId: string) {
        super("bad-attendance-token", "Неправильный или устаревший код", {
            httpCode: 404,
            actor: actorId
        });
    }
}
