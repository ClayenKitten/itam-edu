import { injectable } from "inversify";
import type { User } from "itam-edu-common";
import { CourseRepository } from "../courses/repository";
import { S3 } from "../infra/s3";
import { parseFileSpec } from "./parser";
import {
    UserAvatar,
    CourseCover,
    CourseBanner,
    CourseIcon,
    LessonCover,
    LessonVideo,
    type FileSpec
} from "./specs";
import { BadRequestError, NotFoundError, type HttpError } from "../api/errors";

/** Uploads file. */
@injectable()
export class UploadFile {
    public constructor(
        private s3: S3,
        private courseRepository: CourseRepository
    ) {}

    public async invoke(
        actor: User | null,
        path: string[],
        blob: Blob
    ): Promise<string | HttpError> {
        const spec = parseFileSpec(path);
        if (!spec) return new BadRequestError("Requested route is invalid.");

        const allowed = await this.isAllowed(actor, spec);
        if (!allowed) {
            return new NotFoundError(
                "You are not allowed to upload that file."
            );
        }

        const pathStr = `/${path.join("/")}`;
        await this.s3.upload(pathStr, blob);
        return pathStr;
    }

    private async isAllowed(
        actor: User | null,
        spec: FileSpec
    ): Promise<boolean> {
        if (spec instanceof UserAvatar) {
            return actor !== null && actor.id === spec.userId;
        }

        if (
            spec instanceof CourseCover ||
            spec instanceof CourseBanner ||
            spec instanceof CourseIcon
        ) {
            const course = await this.courseRepository.getById(spec.courseId);
            const permissions = course?.getPermissionsFor(actor);
            if (!course || !permissions) {
                return false;
            }
            if (permissions.course.update !== true) {
                return false;
            }
            return true;
        }

        if (spec instanceof LessonCover || spec instanceof LessonVideo) {
            const course = await this.courseRepository.getById(spec.courseId);
            const permissions = course?.getPermissionsFor(actor);
            if (!course || !permissions) {
                return false;
            }
            if (permissions.lessons.edit !== true) {
                return false;
            }
            return true;
        }

        const _never: never = spec as never;
        return false;
    }
}
