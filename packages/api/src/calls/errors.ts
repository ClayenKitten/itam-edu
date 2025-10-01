import { NotFoundError } from "../errors";

/** Call does not exist or user has no access to it. */
export class CallNotFound extends NotFoundError {
    public code: string = "call-not-found";
    public message: string =
        "Звонок не существует или у вас нет к нему доступа";

    public constructor(protected callId: string) {
        super();
        this.meta = { resource: { kind: "call", id: this.callId } };
    }
}
