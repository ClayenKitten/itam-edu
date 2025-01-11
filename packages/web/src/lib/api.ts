import { browser } from "$app/environment";
import { env } from "$env/dynamic/public";
import { error } from "@sveltejs/kit";
import { hc } from "hono/client";
import type { AppType } from "itam-edu-api";

export default function api(init: { fetch: Window["fetch"] }) {
    const baseUrl = browser
        ? env.PUBLIC_ITAM_EDU_WEB_API_URL_BROWSER!
        : env.PUBLIC_ITAM_EDU_WEB_API_URL_SERVER!;
    const client = hc<AppType>(baseUrl, {
        fetch: getFetchWithHook(init.fetch)
    });
    return client;
}

const getFetchWithHook = (base: Window["fetch"]): Window["fetch"] => {
    return async (input, init) => {
        const response = await base(input, { credentials: "include", ...init });
        if (!response.ok) {
            if (browser) {
                // TODO: display toast notification
            } else {
                error(response.status, response.statusText);
            }
        }
        return response;
    };
};
