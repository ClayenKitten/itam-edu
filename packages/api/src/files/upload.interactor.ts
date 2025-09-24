import { injectable } from "inversify";
import type { User } from "itam-edu-common";
import { CourseRepository } from "../courses/repository";
import { S3 } from "../infra/s3";
import { getFileRoute, type FileRoute } from "./router";
import { BadRequestError, NotFoundError, type HttpError } from "../api/errors";

/** Uploads file. */
@injectable()
export class UploadFile {
    public constructor(
        private s3: S3,
        private courseRepository: CourseRepository
    ) {}

    public async invoke(
        /** User uploading the file. */
        actor: User | null,
        /**
         * Path to the file.
         *
         * @example
         * ["courses", "1234", "banner.png"]
         * */
        path: string[],
        /** Binary data to upload. */
        blob: Blob
    ): Promise<string | HttpError> {
        const route = getFileRoute(path);
        if (!route) return new BadRequestError("Requested route is invalid.");

        if (!this.isAllowed(actor, route)) {
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
        route: FileRoute
    ): Promise<boolean> {
        switch (route.scope) {
            case "course":
            case "course":
            case "course": {
                const course = await this.courseRepository.getById(
                    route.courseId
                );
                const permissions = course?.getPermissionsFor(actor);
                if (!course || !permissions) {
                    return false;
                }
                if (permissions.course.update !== true) {
                    return false;
                }
                return true;
            }
            case "lesson":
            case "lesson": {
                const course = await this.courseRepository.getById(
                    route.courseId
                );
                const permissions = course?.getPermissionsFor(actor);
                if (!course || !permissions) {
                    return false;
                }
                if (permissions.lessons.edit !== true) {
                    return false;
                }
                return true;
            }
            case "user": {
                return actor !== null && actor.id === route.userId;
            }
            default:
                let guard: never = route;
                return false;
        }
    }
}
