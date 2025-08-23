import { injectable } from "inversify";
import { CourseRepository } from "../courses/repository";
import type { User } from "itam-edu-common";

/** Checks whether the file may be accessed or modified by the user. */
// TODO: that class may be split by file type, e.g. `CourseFileAuthorizer`, `UserAvatarAuthorizer`, etc.
// This would help with coupling because data required for advanced checks may differ noticeably.
@injectable()
export class FileAuthorizer {
    public constructor(protected courseRepository: CourseRepository) {}

    public async canDownloadCourseFile(
        _actor: User | null,
        _courseId: string,
        _fileId: string
    ): Promise<boolean> {
        return true;
    }

    public async canUploadCourseFile(
        actor: User,
        courseId: string,
        _fileId: string
    ): Promise<boolean> {
        return actor.isCourseStaff(courseId);
    }

    public async canDownloadUserAvatar(
        _actor: User | null,
        _userId: string
    ): Promise<boolean> {
        return true;
    }

    public async canUploadUserAvatar(
        actor: User,
        userId: string
    ): Promise<boolean> {
        return actor.id === userId;
    }
}
