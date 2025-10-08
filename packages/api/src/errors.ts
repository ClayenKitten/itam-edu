/**
 * Expected application error.
 *
 * Domain services are expected to extend this class to support type matching,
 * while application services might return this class directly.
 * */
export class AppError extends Error {
    public constructor(
        /** Machine-friendly error code that will be forwarded to the client. */
        public code: string,
        /** Human-readable message that will be forwarded to the client. */
        public message: string,
        /** Structured metadata for logging. */
        public meta?: AppErrorMeta,
        /** Optional parent error. */
        public cause?: Error
    ) {
        super(message, { cause });
    }
}
export type AppErrorMeta = Partial<{
    actor: string;
    resource: { kind: string; id: string };
    httpCode: number;
}>;
