import { env } from "$env/dynamic/public";
import type { HandleFetch } from "@sveltejs/kit";

export const handleFetch: HandleFetch = async ({ event, request, fetch }) => {
    const cookie = event.request.headers.get("cookie");
    if (
        request.url.startsWith(env.PUBLIC_ITAM_EDU_WEB_API_URL_SERVER!) &&
        cookie !== null
    ) {
        request.headers.set("cookie", cookie);
    }

    return fetch(request);
};
