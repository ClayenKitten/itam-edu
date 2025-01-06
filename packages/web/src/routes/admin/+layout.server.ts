import api from "$lib/api";
import { error } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ fetch }) => {
    const userResp = await api({ fetch }).users.me.$get();
    if (userResp.status === 404) error(404);
    const user = await userResp.json();

    return { user };
};
