import type { UserDto } from "itam-edu-api/src/features/users/query";
import type { LayoutLoad } from "./$types";
import api from "$lib/api";
import { error } from "@sveltejs/kit";
import type { Call } from "$lib/types";

export const load: LayoutLoad = ({ data, fetch }) => {
    const users = getUsers(fetch);
    const calls = getCalls(fetch);
    return {
        user: data.user,
        calls,
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

async function getCalls(fetch: typeof window.fetch): Promise<Call[]> {
    const response = await api({ fetch }).calls.get();
    if (response.error) {
        error(response.status, "Не удалось загрузить список звонков");
    }
    return response.data;
}
