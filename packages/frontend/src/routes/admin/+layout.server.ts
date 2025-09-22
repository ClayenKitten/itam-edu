import { error } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ fetch, depends, locals }) => {
    depends("app:user");

    const user = locals.user;
    if (
        !user ||
        (user.info.role !== "admin" && user.info.role !== "supervisor")
    ) {
        error(403);
    }

    return { user };
};
