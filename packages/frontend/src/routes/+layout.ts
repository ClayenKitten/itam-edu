import api from "$lib/api";
import { error } from "@sveltejs/kit";
import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = async ({ fetch, depends }) => {
    depends("app:user", "app:permissions", "app:courses");

    const [userResp, coursesResp] = await Promise.all([
        api({ fetch }).users.me.get(),
        api({ fetch }).courses.get()
    ]);

    if (coursesResp.error) error(coursesResp.status);
    const courses = coursesResp.data;

    if (userResp.error) return { user: null, permissions: null, courses };
    const { user, permissions } = userResp.data;

    return { user, permissions, courses };
};
