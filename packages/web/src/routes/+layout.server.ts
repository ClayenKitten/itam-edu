import api from "$lib/api";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ fetch, depends }) => {
    depends("app:user", "app:permissions");

    const userResp = await api({
        fetch,
        enableDefaultCatch: false
    }).users.me.$get();
    if (!userResp.ok) return { user: null, permissions: null };
    const { user, permissions } = await userResp.json();

    return { user, permissions };
};
