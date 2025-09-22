import type { UserDto } from "itam-edu-api/src/users/query";
import type { LayoutLoad } from "./$types";
import api from "$lib/api";
import { error } from "@sveltejs/kit";

export const load: LayoutLoad = ({ data, fetch }) => {
    const users = getUsers(fetch);
    return {
        user: data.user,
        users
    };
};

async function getUsers(fetch: typeof window.fetch): Promise<UserDto[]> {
    const response = await api({ fetch }).users.get();
    if (response.error) {
        error(response.status, "Не удалось загрузить список пользователей");
    }
    return response.data;
}
