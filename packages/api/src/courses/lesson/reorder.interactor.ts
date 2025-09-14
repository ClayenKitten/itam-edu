import { injectable } from "inversify";
import { HttpError, NotFoundError, UnauthorizedError } from "../../api/errors";
import type { User } from "itam-edu-common";
import { LessonRepository } from "./repository";
import * as schema from "./schema";
import { CourseRepository } from "../repository";

@injectable()
export class ReorderLessons {
    public constructor(
        private repo: LessonRepository,
        private courseRepo: CourseRepository
    ) {}

    /** Creates new lesson. */
    public async invoke(
        actor: User,
        courseId: string,
        newOrder: typeof schema.reorderLessonsList.static
    ): Promise<void | HttpError> {
        const course = await this.courseRepo.getById(courseId);
        const permissions = course?.getPermissionsFor(actor);
        if (!course || !permissions) {
            return new NotFoundError("Course does not exist.");
        }
        if (permissions.lessons.edit !== true) {
            return new UnauthorizedError(
                "You are not allowed to edit lessons."
            );
        }

        await this.repo.reorder(course, newOrder);
    }
}
