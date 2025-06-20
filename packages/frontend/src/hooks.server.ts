import { env } from "$env/dynamic/public";
import type { Handle, HandleFetch, ServerInit } from "@sveltejs/kit";

export const handleFetch: HandleFetch = async ({ event, request, fetch }) => {
    console.log(`Fetch ${request.url}`);
    const cookies = event.request.headers.get("cookie");
    const token = cookies ? getCookie(cookies, "itam-edu-token") : undefined;
    if (request.url.startsWith(env.ITAMEDU_PUBLIC_API_URL_SERVER!) && token) {
        request.headers.set("authorization", token);
    }
    return fetch(request);
};

const getCookie = (cookies: string, name: string): string | undefined => {
    return cookies
        .split("; ")
        .find(row => row.startsWith(`${name}=`))
        ?.split("=")[1];
};

export const handle: Handle = async ({ event, resolve }) =>
    resolve(event, {
        filterSerializedResponseHeaders: header => header === "content-type"
    });

export const init: ServerInit = async () => {
    if (process.env.ITAMEDU_FRONTEND_PORT) {
        process.env.PORT = process.env.ITAMEDU_FRONTEND_PORT;
    }
    process.env.HOST = "0.0.0.0";
};
