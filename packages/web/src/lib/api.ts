import { browser } from "$app/environment";
import { env } from "$env/dynamic/public";
import { error } from "@sveltejs/kit";
import { hc } from "hono/client";
import type { AppType } from "itam-edu-api";

export default function api(params: ApiParams) {
    const baseUrl = browser
        ? env.PUBLIC_ITAM_EDU_WEB_API_URL_BROWSER!
        : env.PUBLIC_ITAM_EDU_WEB_API_URL_SERVER!;

    const authorization = browser ? getCookie("itam-edu-token") : undefined;
    const headers = authorization
        ? { authorization: `Bearer ${authorization}` }
        : undefined;

    const client = hc<AppType>(baseUrl, {
        fetch: getFetchWithHook(params),
        headers
    });
    return client;
}

type ApiParams = {
    fetch: Window["fetch"];
    /**
     * Enables default error handler.
     *
     * When set to `true`, all 4xx and 5xx responses will be propagated to SvelteKit errors
     * (on server) or displayed to user (in browser).
     *
     * Defaults to `true`.
     * */
    enableDefaultCatch?: boolean;
};

const getFetchWithHook = (params: ApiParams): Window["fetch"] => {
    return async (input, init) => {
        const response = await params.fetch(input, init);
        if (params.enableDefaultCatch !== false && !response.ok) {
            if (browser) {
                // TODO: display toast notification
            } else {
                error(response.status, response.statusText);
            }
        }
        return response;
    };
};

const getCookie = (name: string): string | undefined => {
    return document.cookie
        .split("; ")
        .find(row => row.startsWith(`${name}=`))
        ?.split("=")[1];
};
