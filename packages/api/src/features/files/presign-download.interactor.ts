import { injectable } from "inversify";
import type { User } from "itam-edu-common";
import { CourseRepository } from "../courses/repository";
import { S3 } from "../../infra/s3";
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
import {
    BadRequestError,
    NotFoundError,
    type HttpError
} from "../../api/errors";

/**
 * Presigns download URL for the file.
 *
 * `itam-edu-files` is expected to proxy returned urls, though some clients
 * may decide to use them directly.
 */
@injectable()
export class PresignDownloadUrl {
    public constructor(
        private s3: S3,
        private courseRepository: CourseRepository
    ) {}

    /** Returns presigned url to download a file. */
    public async invoke(
        actor: User | null,
        path: string[]
    ): Promise<string | HttpError> {
        const spec = parseFileSpec(path);
        if (!spec) {
            return new BadRequestError("Requested route is invalid.");
        }

        const allowed = await this.isAllowed(actor, spec);
        if (!allowed) {
            return new NotFoundError("Requested file does not exist.");
        }

        const pathStr = `/${path.join("/")}`;
        return this.s3.signUrl(pathStr, "GET");
    }

    private async isAllowed(
        actor: User | null,
        spec: FileSpec
    ): Promise<boolean> {
        if (spec instanceof UserAvatar) return true;
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
            return true;
        }
        if (spec instanceof LessonCover || spec instanceof LessonVideo) {
            const course = await this.courseRepository.getById(spec.courseId);
            const permissions = course?.getPermissionsFor(actor);
            if (!course || !permissions) {
                return false;
            }
            return true;
        }
        return false;
    }
}
