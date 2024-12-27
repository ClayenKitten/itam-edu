import { browser } from "$app/environment";
import { env as public_env } from "$env/dynamic/public";
import { env as private_env } from "$env/dynamic/private";
import { hc } from "hono/client";
import type { AppType } from "itam-edu-api";

export default function api(init: { fetch: Window["fetch"] }) {
    const baseUrl = browser
        ? public_env.PUBLIC_ITAM_EDU_WEB_API_URL
        : private_env.ITAM_EDU_WEB_API_URL;
    const client = hc<AppType>(baseUrl, { fetch: init.fetch });
    return client;
}
