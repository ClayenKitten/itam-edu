import { injectable } from "inversify";
import { User } from "itam-edu-common";
import { CallDao, type CallDto } from "./dao";
import { CourseRepository } from "../courses/repository";
import { CallNotFound } from "./errors";
import { CourseNotFound } from "../courses/errors";
import { AppError } from "../../errors";

@injectable()
export class CallQuery {
    public constructor(
        private dao: CallDao,
        private courseRepo: CourseRepository
    ) {}

    /**
     * Returns a call by id.
     *
     * @throws {CallNotFound}
     */
    public async get(
        actor: User | null,
        callId: string
    ): Promise<CallDto | null> {
        const call = await this.dao.get(callId);
        if (!call) throw new CallNotFound(callId);
        return call;
    }

    /**
     * Returns all calls.
     *
     * @throws {AppError}
     * */
    public async getAll(actor: User): Promise<CallDto[]> {
        if (actor.permissions.calls.view !== true) {
            throw new AppError(
                "not-allowed-get-all-calls",
                "Вы не имеете права на просмотр списка звонков",
                { httpCode: 403, actor: actor.id }
            );
        }
        return await this.dao.getAll();
    }

    /**
     * Returns all calls for the course.
     *
     * @throws {AppError}
     * */
    public async getAllForCourse(
        actor: User,
        courseId: string
    ): Promise<CallDto[]> {
        const course = await this.courseRepo.getById(courseId);
        const permissions = course?.getPermissionsFor(actor);
        if (!course || !permissions) {
            throw new CourseNotFound(courseId);
        }
        if (permissions.calls.list !== true) {
            throw new AppError(
                "not-allowed-get-all-course-calls",
                "Вы не имеете права на просмотр списка звонков курса",
                { httpCode: 403, actor: actor.id }
            );
        }
        return await this.dao.getAll(courseId);
    }
}
