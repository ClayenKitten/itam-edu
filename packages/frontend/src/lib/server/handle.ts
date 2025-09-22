import { error, type Handle } from "@sveltejs/kit";
import api from "../api";
import { User } from "itam-edu-common";
import { createConfigFromEnv } from "itam-edu-common/config";

/**
 * Middleware for requests to SvelteKit server.
 *
 * Populates locals and removes invalid tokens.
 * */
export const handle: Handle = async ({ event, resolve }) => {
    event.locals.config = createConfigFromEnv();

    const token = event.cookies.get("itam-edu-token");

    let user: User | null = null;
    if (token !== undefined) {
        user = await getUser(event.fetch);
        if (user === null) {
            event.cookies.delete("itam-edu-token", { path: "/" });
        }
    }
    event.locals.user = user;

    const response = await resolve(event, {
        filterSerializedResponseHeaders: header => header === "content-type"
    });

    return response;
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
