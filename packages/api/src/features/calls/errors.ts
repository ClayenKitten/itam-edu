import { AppError } from "../../errors";

/** Call does not exist or user has no access to it. */
export class CallNotFound extends AppError {
    public constructor(callId: string) {
        super(
            "call-not-found",
            "Звонок не существует или у вас нет к нему доступа",
            { httpCode: 404, resource: { kind: "call", id: callId } }
        );
    }
}
