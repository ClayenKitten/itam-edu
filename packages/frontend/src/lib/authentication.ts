import { User } from "itam-edu-common";
import api from "./api";
import { error } from "@sveltejs/kit";
import { getRequestEvent } from "$app/server";
import type { RequestEvent } from "../routes/$types";

/**
 * Handles user authentication.
 *
 * Extracts token from the `itam-edu-token` cookie, and stores User object in the event locals.
 *
 * If authentication with provided token fails, token cookie is removed.
 * */
export async function getUser(
    fetch: RequestEvent["fetch"],
    cookies: RequestEvent["cookies"]
): Promise<User | null> {
    const token = cookies.get("itam-edu-token");
    if (token === undefined) {
        return null;
    }

    const response = await api({ fetch }).users.me.get();
    if (response.error) {
        if (response.status === 401) {
            cookies.delete("itam-edu-token", { path: "/" });
            return null;
        }
        error(response.status);
    }
    const { user } = response.data;
    return new User(user.id, user.info, user.telegram, user.courses);
}
