import { injectable } from "inversify";
import type { User } from "itam-edu-common";
import { CourseRepository } from "../courses/repository";
import { S3 } from "../infra/s3";
import { getFileRoute, type FileRoute } from "./router";
import { BadRequestError, NotFoundError, type HttpError } from "../api/errors";

/**
 * Presigns download URL for the file.
 *
 * `itam-edu-files` is expected to proxy returned urls, though some clients
 * may decide to use them directly.
 * */
@injectable()
export class PresignDownloadUrl {
    public constructor(
        private s3: S3,
        private courseRepository: CourseRepository
    ) {}

    /** Returns presigned url to download a file. */
    public async invoke(
        /** User requesting presigned url. */
        actor: User | null,
        /**
         * Path to the file.
         *
         * @example
         * ["courses", "1234", "banner.png"]
         * */
        path: string[]
    ): Promise<string | HttpError> {
        const route = getFileRoute(path);
        if (!route) return new BadRequestError("Requested route is invalid.");

        if (!this.isAllowed(actor, route)) {
            return new NotFoundError("Requested file does not exist.");
        }

        const pathStr = `/${path.join("/")}`;
        const url = await this.s3.signUrl(pathStr, "GET");
        return url;
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
                return true;
            }
            case "user": {
                return true;
            }
            default:
                let guard: never = route;
                return false;
        }
    }
}
