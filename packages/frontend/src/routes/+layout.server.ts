import { User } from "itam-edu-common";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ depends, locals }) => {
    depends("app:user");

    const user: User | null = locals.user;
    if (user === null) {
        return { user: null };
    }
    return { user };
};
