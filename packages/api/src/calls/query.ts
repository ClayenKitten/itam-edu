import { injectable } from "inversify";
import { User } from "itam-edu-common";
import { ForbiddenError, type HttpError } from "../api/errors";
import { CallDao, type CallDto } from "./dao";

@injectable()
export class CallQuery {
    public constructor(private dao: CallDao) {}

    public async get(
        actor: User | null,
        callId: string
    ): Promise<CallDto | null | HttpError> {
        const call = await this.dao.get(callId);
        return call;
    }

    public async getAll(actor: User): Promise<CallDto[] | HttpError> {
        if (actor.permissions.calls.view !== true) {
            return new ForbiddenError(
                "You are not allowed to view global calls list."
            );
        }
        return await this.dao.getAll();
    }

    public async getAllForCourse(
        actor: User,
        courseId: string
    ): Promise<CallDto[] | HttpError> {
        if (actor.permissions.calls.view !== true) {
            return new ForbiddenError(
                "You are not allowed to view course calls list."
            );
        }
        return await this.dao.getAll(courseId);
    }
}
