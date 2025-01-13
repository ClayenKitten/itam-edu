import { error, redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ parent, url }) => {
    const { user, permissions } = await parent();
    if (!user) return redirectSignin(url);
    if (!permissions.user.isStaff) error(403);

    return { user };
};

function redirectSignin(current: URL): never {
    if (current.pathname === "/") {
        redirect(307, "/signin");
    } else {
        redirect(
            307,
            `/signin?redirect=${encodeURIComponent(current.pathname)}`
        );
    }
}
