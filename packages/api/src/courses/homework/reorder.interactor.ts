import { injectable } from "inversify";
import { ForbiddenError, HttpError, NotFoundError } from "../../api/errors";
import { CourseRepository } from "../repository";
import type { User } from "itam-edu-common";
import { HomeworkRepository } from "./repository";
import * as schema from "./schema";

@injectable()
export class ReorderHomeworks {
    public constructor(
        private courseRepo: CourseRepository,
        private repo: HomeworkRepository
    ) {}

    public async invoke(
        actor: User,
        courseId: string,
        homeworksList: typeof schema.reorderHomeworksList.static
    ): Promise<void | HttpError> {
        const course = await this.courseRepo.getById(courseId);
        const permissions = course?.getPermissionsFor(actor);
        if (!course || !permissions) {
            return new NotFoundError("Course does not exist.");
        }
        if (permissions.homeworks.edit !== true) {
            return new ForbiddenError(
                "You are not allowed to reorder homeworks."
            );
        }

        await this.repo.reorder(courseId, homeworksList);
    }
}
