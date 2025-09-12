import { getUser } from "$lib/authentication";
import type {
    Handle,
    HandleFetch,
    HandleServerError,
    ServerInit
} from "@sveltejs/kit";
import { ConfigError, createConfigFromEnv } from "itam-edu-common/config";

export const init: ServerInit = async () => {
    if (process.env.ITAMEDU_FRONTEND_PORT) {
        process.env.PORT = process.env.ITAMEDU_FRONTEND_PORT;
    }
    process.env.HOST = "0.0.0.0";
};

export const handle: Handle = async ({ event, resolve }) => {
    event.locals.config = createConfigFromEnv();
    event.locals.user = await getUser(event.fetch, event.cookies);

    const response = resolve(event, {
        filterSerializedResponseHeaders: header => header === "content-type"
    });
    return response;
};

export const handleFetch: HandleFetch = async ({ event, request, fetch }) => {
    console.log(`Fetch ${request.url}`);

    const apiUrl = event.locals.config.origin + "/api";

    const cookies = event.request.headers.get("cookie");
    const token = cookies ? getCookie(cookies, "itam-edu-token") : undefined;
    if (request.url.startsWith(apiUrl) && token) {
        request.headers.set("authorization", token);
    }
    return fetch(request);
};

export const handleError: HandleServerError = async ({ error }) => {
    if (error instanceof ConfigError) {
        console.error(
            `ConfigError: invalid configuration provided: ${JSON.stringify(error.fields)}`
        );
    }
};

const getCookie = (cookies: string, name: string): string | undefined => {
    return cookies
        .split("; ")
        .find(row => row.startsWith(`${name}=`))
        ?.split("=")[1];
};
