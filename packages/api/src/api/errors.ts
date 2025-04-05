export abstract class HttpError extends Error {
    public constructor(
        public code: number,
        message?: string
    ) {
        super(message);
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
