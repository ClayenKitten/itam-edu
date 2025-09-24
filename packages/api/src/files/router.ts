import type { UUID } from "crypto";

/** Parsed file route. */
export type FileRoute =
    | { scope: "user"; file: "avatar"; userId: string }
    | { scope: "course"; file: "cover"; courseId: string }
    | { scope: "course"; file: "banner"; courseId: string }
    | { scope: "course"; file: "icon"; courseId: string }
    | { scope: "lesson"; file: "cover"; courseId: string; lessonId: string }
    | { scope: "lesson"; file: "video"; courseId: string; lessonId: string };

/** Returns {@link FileRoute} for provided path segments, or null if no matching route found. */
export function getFileRoute(path: string[]): FileRoute | null {
    if (path[0] === "users" && isUuid(path[1])) {
        const [_, userId, ...rest] = path;
        return getUserFileRoute(userId, rest);
    }
    if (path[0] === "courses" && isUuid(path[1])) {
        const [_, courseId, ...rest] = path;
        return getCourseFileRoute(courseId, rest);
    }
    return null;
}

function getUserFileRoute(userId: UUID, path: string[]): FileRoute | null {
    if (path[0] !== undefined) {
        const name = stripExtension(path[0]);
        if (path.length > 1) return null;
        if (name === "avatar") {
            return { scope: "user", file: "avatar", userId };
        }
    }
    return null;
}

function getCourseFileRoute(courseId: UUID, path: string[]): FileRoute | null {
    if (path[0] === "lessons" && isUuid(path[1]) && path[2] !== undefined) {
        const lessonId = path[1];
        const name = stripExtension(path[2]);
        if (path.length !== 3) return null;
        switch (name) {
            case "cover":
                return { scope: "lesson", file: "cover", courseId, lessonId };
            case "video":
                return { scope: "lesson", file: "video", courseId, lessonId };
            default:
                return null;
        }
    }
    if (path[0] !== undefined) {
        const name = stripExtension(path[0]);
        if (path.length !== 1) return null;
        switch (name) {
            case "cover":
                return { scope: "course", file: "cover", courseId };
            case "banner":
                return { scope: "course", file: "banner", courseId };
            case "icon":
                return { scope: "course", file: "icon", courseId };
            default:
                return null;
        }
    }
    return null;
}

function isUuid(id: string | undefined): id is UUID {
    if (id === undefined) return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(
        id
    );
}

function stripExtension(filename: string): string {
    const idx = filename.lastIndexOf(".");
    return idx >= 0 ? filename.slice(0, idx) : filename;
}
