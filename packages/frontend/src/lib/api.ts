import { browser } from "$app/environment";
import { env } from "$env/dynamic/public";
import { treaty } from "@elysiajs/eden";
import type { ApiTreaty } from "itam-edu-api/src/api";

export default function api(params: ApiParams) {
    const baseUrl = env.ITAMEDU_PUBLIC_API_URL_BROWSER!;

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

const getCookie = (name: string): string | undefined => {
    return document.cookie
        .split("; ")
        .find(row => row.startsWith(`${name}=`))
        ?.split("=")[1];
};
