export abstract class HttpError extends Error {
    public constructor(
        public code: 400 | 401 | 403 | 404 | 409,
        message?: string
    ) {
        super(message);
    }
}

export class BadRequestError extends HttpError {
    public constructor(message?: string) {
        super(400, message ?? "Bad Request");
    }
}

export class UnauthorizedError extends HttpError {
    public constructor(message?: string) {
        super(401, message ?? "Unauthorized");
    }
}

export class ForbiddenError extends HttpError {
    public constructor(message?: string) {
        super(403, message ?? "Forbidden");
    }
}

export class NotFoundError extends HttpError {
    public constructor(message?: string) {
        super(404, message ?? "Not Found");
    }
}

export class ConflictError extends HttpError {
    public constructor(message?: string) {
        super(409, message ?? "Conflict");
    }
}
