import { error } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ parent }) => {
    const { user, permissions } = await parent();
    if (!user) error(401);
    if (!permissions.user.isStaff) error(403);

    return { user };
};
