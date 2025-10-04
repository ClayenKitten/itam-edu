import { injectable } from "inversify";
import { AttendanceDao } from "./dao";
import type { User } from "itam-edu-common";
import { CourseRepository } from "../../repository";
import {
    ForbiddenError,
    NotFoundError,
    type HttpError
} from "../../../../api/errors";
import { LessonRepository } from "../repository";
import { UserRepository } from "../../../users/repository";

@injectable()
export class RemoveAttendance {
    public constructor(
        private dao: AttendanceDao,
        private courseRepo: CourseRepository,
        private lessonRepo: LessonRepository,
        private userRepo: UserRepository
    ) {}

    public async invoke(
        actor: User,
        courseId: string,
        lessonId: string,
        userId: string
    ): Promise<void | HttpError> {
        const course = await this.courseRepo.getById(courseId);
        const permissions = course?.getPermissionsFor(actor);

        if (!course || !permissions) {
            return new NotFoundError("Course does not exist.");
        }
        if (permissions.attendance.edit !== true) {
            return new ForbiddenError(
                "You are not allowed to remove users from attendance."
            );
        }

        const [user, lesson] = await Promise.all([
            this.userRepo.getById(userId),
            this.lessonRepo.load(courseId, lessonId)
        ]);
        if (!user || !lesson) {
            return new NotFoundError("Lesson not found.");
        }

        await this.dao.remove(actor, lesson, user);
    }
}
