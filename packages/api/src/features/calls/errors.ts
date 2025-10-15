import { AppError } from "../../errors";

/** Call does not exist or user has no access to it. */
export class CallNotFound extends AppError {
    public constructor(callId: string) {
        super(
            "call-not-found",
            "Звонок не существует или у вас нет к нему доступа.",
            { httpCode: 404, resource: { kind: "call", id: callId } }
        );
    }
}

/** Call has ended, but needs to be ongoing for that action. */
export class CallEndedConflict extends AppError {
    public constructor(callId: string) {
        super("call-has-ended", "Звонок уже закончился.", {
            httpCode: 409,
            resource: { kind: "call", id: callId }
        });
    }
}

/** Call action was forbidden due to lack of necessary permissions. */
export class CallActionForbidden extends AppError {
    public constructor(callId: string) {
        super("call-forbidden", "Вы не имеете права на это действие.", {
            httpCode: 403,
            resource: { kind: "call", id: callId }
        });
    }
}
