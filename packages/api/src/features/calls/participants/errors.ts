import { AppError } from "../../../errors";

/** Call participant was not found. */
export class ParticipantNotFound extends AppError {
    public constructor() {
        super("call-not-found", "Участник звонка не найден.", {
            httpCode: 404
        });
    }
}
