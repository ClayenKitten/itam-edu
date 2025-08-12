import { browser } from "$app/environment";
import { env } from "$env/dynamic/public";
import { treaty } from "@elysiajs/eden";
import type { ApiTreaty } from "itam-edu-api/src/api";

export default function api(params: ApiParams) {
    const baseUrl = browser
        ? env.ITAMEDU_PUBLIC_API_URL_BROWSER!
        : env.ITAMEDU_PUBLIC_API_URL_SERVER!;

    const client = treaty<ApiTreaty>(baseUrl, {
        fetcher: params.fetch,
        onRequest: () => {
            if (!browser) return; // On server `hooks.server.ts` is used
            const token = getCookie("itam-edu-token");
            if (!token) return;
            return {
                headers: {
                    authorization: `Bearer ${token}`
                }
            };
        },
        onResponse: async response => {
            if (params.toast) {
                // TODO: display toast notification
                const toast = params.toast(response);
                alert(toast.title);
            }
        }
    });
    return client;
}

type ApiParams = {
    fetch: typeof fetch;
    /** Gets info to display in toast notification. */
    toast?: (response: Response) => { title: string };
};

const getCookie = (name: string): string | undefined => {
    return document.cookie
        .split("; ")
        .find(row => row.startsWith(`${name}=`))
        ?.split("=")[1];
};
