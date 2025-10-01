/** Expected application error. */
export abstract class AppError extends Error {
    /** Machine-friendly error code that will be forwarded to the client. */
    public abstract code: string;
    /** Human-readable message that will be forwarded to the client. */
    public abstract message: string;
    /** Structured metadata for logging. */
    public meta?: Record<string, unknown> = undefined;
    /** Optional parent error. */
    public cause?: Error = undefined;
}

export abstract class NotFoundError extends AppError {
    public override meta?: Record<string, unknown> & {
        resource?: { kind: string; id: string };
    } = undefined;
}

export class ForbiddenError extends AppError {
    public constructor(
        /** Machine-friendly error code that will be forwarded to the client. */
        public code: string,
        /** Human-readable message that will be forwarded to the client. */
        public message: string,
        /** Structured metadata for logging. */
        public meta?: Record<string, unknown>,
        /** Optional parent error. */
        public cause?: Error
    ) {
        super();
    }
}

export abstract class ConflictError extends AppError {}

export function errorToHttpStatus(error: Error): number {
    if (error instanceof NotFoundError) {
        return 404;
    }
    if (error instanceof ForbiddenError) {
        return 403;
    }
    if (error instanceof ConflictError) {
        return 409;
    }
    if (error instanceof AppError) {
        return 400;
    }
    return 500;
}
