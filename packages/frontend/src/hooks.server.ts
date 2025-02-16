import { env } from "$env/dynamic/public";
import type { HandleFetch } from "@sveltejs/kit";

export const handleFetch: HandleFetch = async ({ event, request, fetch }) => {
    const cookies = event.request.headers.get("cookie");
    const token = cookies ? getCookie(cookies, "itam-edu-token") : undefined;
    if (
        request.url.startsWith(env.PUBLIC_ITAM_EDU_FRONTEND_API_URL_SERVER!) &&
        token
    ) {
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
