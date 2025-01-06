import { browser } from "$app/environment";
import { env as public_env } from "$env/dynamic/public";
import { hc } from "hono/client";
import type { AppType } from "itam-edu-api";

export default function api(init: { fetch: Window["fetch"] }) {
    const baseUrl = browser
        ? public_env.PUBLIC_ITAM_EDU_WEB_API_URL_BROWSER!
        : public_env.PUBLIC_ITAM_EDU_WEB_API_URL_SERVER!;
    const client = hc<AppType>(baseUrl, { fetch: init.fetch });
    return client;
}
