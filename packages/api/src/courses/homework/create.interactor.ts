import { injectable } from "inversify";
import { ForbiddenError, HttpError, NotFoundError } from "../../api/errors";
import { CourseRepository } from "../repository";
import type { User } from "itam-edu-common";
import { HomeworkRepository } from "./repository";
import type Homework from "./entity";
import * as schema from "./schema";

@injectable()
export class CreateHomework {
    public constructor(
        private courseRepo: CourseRepository,
        private repo: HomeworkRepository
    ) {}

    public async invoke(
        actor: User,
        courseId: string,
        homeworkInfo: typeof schema.createHomework.static
    ): Promise<Homework | HttpError> {
        const course = await this.courseRepo.getById(courseId);
        const permissions = course?.getPermissionsFor(actor);
        if (!course || !permissions) {
            return new NotFoundError("Course does not exist.");
        }
        if (permissions.homeworks.edit !== true) {
            return new ForbiddenError(
                "You are not allowed to create homeworks."
            );
        }

        return await this.repo.create(courseId, homeworkInfo);
    }
}
