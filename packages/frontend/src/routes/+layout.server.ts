import { User } from "itam-edu-common";
import type { LayoutServerLoad } from "./$types";
import api from "$lib/api";
import { error } from "@sveltejs/kit";

export const load: LayoutServerLoad = async ({ depends, fetch, cookies }) => {
    depends("app:user");

    const token = cookies.get("itam-edu-token");
    if (token === null) {
        return { user: null };
    }

    const user: User | null = await getUser(fetch);
    if (user === null) {
        cookies.delete("itam-edu-token", { path: "/" });
        return { user: null };
    }
    return {
        user: {
            id: user.id,
            info: user.info,
            telegram: user.telegram,
            courses: user.courses
        }
    };
};

async function getUser(fetch: typeof window.fetch): Promise<User | null> {
    const response = await api({ fetch }).users.me.get();
    if (response.error) {
        if (response.status === 401) {
            return null;
        }
        error(response.status);
    }
    const { user } = response.data;
    return new User(user.id, user.info, user.telegram, user.courses);
}
