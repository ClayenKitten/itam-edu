import type { AppError } from "../errors";

/**
 * @deprecated Use {@link AppError} instead.
 */
export abstract class HttpError extends Error {
    public constructor(
        public code: 400 | 401 | 403 | 404 | 409,
        message?: string
    ) {
        super(message);
    }
}

/**
 * @deprecated Use {@link AppError} and its subclasses instead.
 */
export class BadRequestError extends HttpError {
    public constructor(message?: string) {
        super(400, message ?? "Bad Request");
    }
}

/**
 * @deprecated Use {@link "../errors NotAllowed"} inste.
 */
export class UnauthorizedError extends HttpError {
    public constructor(message?: string) {
        super(401, message ?? "Unauthorized");
    }
}

/**
 * @deprecated Use {@link AppError} and its subclasses instead.
 */
export class ForbiddenError extends HttpError {
    public constructor(message?: string) {
        super(403, message ?? "Forbidden");
    }
}

/**
 * @deprecated Use {@link AppError} and its subclasses instead.
 */
export class NotFoundError extends HttpError {
    public constructor(message?: string) {
        super(404, message ?? "Not Found");
    }
}

/**
 * @deprecated Use {@link AppError} and its subclasses instead.
 */
export class ConflictError extends HttpError {
    public constructor(message?: string) {
        super(409, message ?? "Conflict");
    }
}
