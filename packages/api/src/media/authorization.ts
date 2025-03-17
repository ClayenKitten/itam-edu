import type Database from "../db";
import logger from "../logger";
import type { User } from "../users/entity";

export default async function authorizeMedia(
    ctx: { db: Database; user: User | null },
    method: RequestMethod,
    path: string
): Promise<boolean> {
    const route = getRoute(path);
    logger.trace("Media route selected", { path, route });
    if (!route) return false;

    if (route.kind === "userAvatar") {
        return ctx.user?.id === route.user;
    }
    if (route.kind === "courseAvatar") {
        if (method === "GET") return true;
        return ctx.user?.permissions.course(route.course)?.canEditInfo === true;
    }
    if (route.kind === "courseFile") {
        if (method === "GET") return true;
        return (
            ctx.user?.permissions.course(route.course)?.canEditContent === true
        );
    }
    return false;
}

export function isSupportedMethod(method: string): method is RequestMethod {
    return SUPPORTED_METHODS.includes(method as RequestMethod);
}
const SUPPORTED_METHODS = ["GET", "PUT", "DELETE"] as const;
export type RequestMethod = (typeof SUPPORTED_METHODS)[number];

function getRoute(path: string) {
    const userAvatar = path.match(/^\/users\/(.+)\/avatar$/);
    if (userAvatar)
        return { kind: "userAvatar", user: userAvatar[1]! } as const;

    const courseAvatar = path.match(/^\/courses\/(.+)\/avatar$/);
    if (courseAvatar)
        return { kind: "courseAvatar", course: courseAvatar[1]! } as const;

    const courseFile = path.match(/^\/courses\/(.+)\/files\/(.+)$/);
    if (courseFile !== null)
        return {
            kind: "courseFile",
            course: courseFile[1]!,
            file: courseFile[2]!
        } as const;

    return null;
}
