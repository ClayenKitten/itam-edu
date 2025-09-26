import type { PageLoad } from "./$types";
import { redirect } from "@sveltejs/kit";

export const load: PageLoad = async ({ depends, parent }) => {
    depends("app:user");
    const { user } = await parent();

    if (!user) {
        redirect(307, "/?login");
    }

    return { user, title: "Профиль | ITAM Education" };
};
