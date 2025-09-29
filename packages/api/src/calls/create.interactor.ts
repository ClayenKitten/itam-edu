import type { User } from "itam-edu-common";
import { randomUUID } from "crypto";
import { injectable } from "inversify";
import { CallDao, type CallDto } from "./dao";
import {
    ConflictError,
    ForbiddenError,
    NotFoundError,
    type HttpError
} from "../api/errors";
import { LessonRepository } from "../courses/lesson/repository";
import { CourseRepository } from "../courses/repository";

@injectable()
export class CreateCall {
    public constructor(
        private dao: CallDao,
        private courseRepo: CourseRepository,
        private lessonRepo: LessonRepository
    ) {}

    public async invoke(
        actor: User,
        options: CreateCallOptions
    ): Promise<CallDto | HttpError> {
        if (options.courseId === undefined) {
            if (actor.permissions.calls.create !== true) {
                return new ForbiddenError(
                    "You are not allowed to create calls."
                );
            }
        } else {
            const course = await this.courseRepo.getById(options.courseId);
            const permissions = course?.getPermissionsFor(actor);
            if (!course || !permissions) {
                return new NotFoundError("Course does not exist.");
            }
            if (permissions.calls.manage !== true) {
                return new ForbiddenError(
                    "You are not allowed to create course calls."
                );
            }
        }

        let id: string = randomUUID();
        let title: string;
        let cover: string | null = null;
        if (options.lessonId !== undefined) {
            const lesson = await this.lessonRepo.load(
                options.courseId,
                options.lessonId
            );
            if (lesson === null) {
                return new NotFoundError("Lesson does not exist.");
            }
            if (lesson.schedule === null) {
                return new ConflictError("Lesson is not scheduled.");
            }
            id = lesson.id;
            title = lesson.info.title;
            cover = lesson.info.banner;
        } else {
            title = options.title;
        }
        const call = await this.dao.create(
            id,
            title,
            options.courseId ?? null,
            actor.id,
            cover
        );
        return call;
    }
}

export type CreateCallOptions =
    | {
          title: string;
          courseId?: undefined;
          lessonId?: undefined;
      }
    | {
          title: string;
          courseId: string;
          lessonId?: undefined;
      }
    | {
          title?: undefined;
          courseId: string;
          lessonId: string;
      };
