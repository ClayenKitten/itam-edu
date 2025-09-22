import type { HandleFetch } from "@sveltejs/kit";
import { env } from "process";

export const handleFetch: HandleFetch = async ({ event, request, fetch }) => {
    const origin = event.locals.config.server.origin;

    console.log(`Fetch to ${request.url}`);
    if (request.url.startsWith(origin)) {
        const cookie = event.request.headers.get("cookie");
        if (cookie) {
            request.headers.set("cookie", cookie);
        }
        request = new Request(
            request.url.replace(
                origin + "/api",
                env.ITAMEDU_PUBLIC_API_URL_SERVER!
            ),
            request
        );
    }
    return fetch(request);
};
