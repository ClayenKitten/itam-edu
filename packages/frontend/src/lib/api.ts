import { browser } from "$app/environment";
import { page } from "$app/state";
import { treaty } from "@elysiajs/eden";
import type { ApiTreaty } from "itam-edu-api/src/api";

export default function api(params: ApiParams) {
    const client = treaty<ApiTreaty>(baseUrl, {
        fetcher: params.fetch,
        onRequest: () => {
            if (!browser) return; // See `hooks.server.ts`
            const token = getCookie("itam-edu-token");
            if (!token) return;
            return {
                headers: {
                    authorization: `Bearer ${token}`
                }
            };
        }
    });
    return client;
}

type ApiParams = {
    fetch: typeof fetch;
};

/**
 * Returns API base URL appropriate for the environment.
 *
 *  In browser it uses `page.data` from `$app/state` to access config, `getRequestEvent` on the server.
 */
const getBaseUrl = async (): Promise<string> => {
    if (browser) {
        return `${page.data.config.origin}/api`;
    } else {
        try {
            const { getRequestEvent } = await import("$app/server");
            const { locals } = getRequestEvent();
            const { host, port } = locals.config.servers.backend;
            return `${host}:${port}`;
        } catch (e) {
            const { host, port } = page.data.config.servers.backend;
            return `${host}:${port}`;
        }
        // return "localhost:5151";
    }
};
const baseUrl = await getBaseUrl();

const getCookie = (name: string): string | undefined => {
    return document.cookie
        .split("; ")
        .find(row => row.startsWith(`${name}=`))
        ?.split("=")[1];
};
