import { injectable } from "inversify";
import { ForbiddenError, HttpError, NotFoundError } from "../../api/errors";
import { CourseRepository } from "../repository";
import type { User } from "itam-edu-common";
import { HomeworkRepository } from "./repository";
import type Homework from "./entity";
import * as schema from "./schema";

@injectable()
export class UpdateHomework {
    public constructor(
        private courseRepo: CourseRepository,
        private repo: HomeworkRepository
    ) {}

    public async invoke(
        actor: User,
        courseId: string,
        homeworkId: string,
        homeworkInfo: typeof schema.updateHomework.static
    ): Promise<Homework | HttpError> {
        const course = await this.courseRepo.getById(courseId);
        const permissions = course?.getPermissionsFor(actor);
        if (!course || !permissions) {
            return new NotFoundError("Course does not exist.");
        }
        if (permissions.homeworks.edit !== true) {
            return new ForbiddenError(
                "You are not allowed to update homeworks."
            );
        }

        const homework = await this.repo.update(
            courseId,
            homeworkId,
            homeworkInfo
        );
        if (homework === null) return new NotFoundError("Homework not found.");
        return homework;
    }
}
