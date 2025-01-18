import api from "$lib/api";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ fetch, depends }) => {
    depends("app:user", "app:permissions");

    const userResp = await api({
        fetch
    }).users.me.get();
    if (userResp.error) return { user: null, permissions: null };
    const { user, permissions } = userResp.data;

    return { user, permissions };
};
