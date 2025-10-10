import { injectable } from "inversify";
import type { User } from "itam-edu-common";
import { CourseRepository } from "../../courses/repository";
import { AppError } from "../../../errors";
import type { FileSpec } from "../specs";
import { UploadService } from "./service";
import {
    UserAvatar,
    CourseCover,
    CourseBanner,
    CourseIcon,
    LessonCover,
    LessonVideo,
    parseFileSpec
} from "../specs/kinds";

/** Uploads file. */
@injectable()
export class UploadFile {
    public constructor(
        private courseRepository: CourseRepository,
        private service: UploadService
    ) {}

    /**
     * Uploads provided file.
     *
     * @throws {AppError}
     */
    public async invoke(
        actor: User | null,
        path: string[],
        blob: Blob
    ): Promise<string> {
        const spec = parseFileSpec(path);
        if (!spec) {
            throw new AppError(
                "invalid-file-spec",
                "Путь к файлу некорректен.",
                { httpCode: 422 }
            );
        }

        const allowed = await this.isAllowed(actor, spec);
        if (!allowed) {
            throw new AppError(
                "forbidden-file-upload",
                "Вы не имеете права на загрузку данного файла.",
                { httpCode: 403, actor: actor?.id }
            );
        }

        const { path: newPath } = await this.service.uploadBlob(spec, blob);
        return newPath;
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

        return false;
    }
}
