import { browser } from "$app/environment";
import { env } from "$env/dynamic/public";
import { treaty } from "@elysiajs/eden";
import type { ApiTreaty } from "itam-edu-api/src/api";

export default function api(params: ApiParams) {
    const baseUrl = browser
        ? env.ITAM_EDU_FRONTEND_API_URL_BROWSER!
        : env.ITAM_EDU_FRONTEND_API_URL_SERVER!;

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
            const path = new URL(response.url).pathname;
            /** Intercept login to set local cookie */
            if (response.status === 200 && path === "/users/me/session") {
                const { token, expires } = await response.clone().json();
                setCookie("itam-edu-token", token, expires);
            }
            if (params.toast) {
                // TODO: display toast notification
                const toast = params.toast(response);
            }
        }
    });
    return client;
}

type ApiParams = {
    fetch: Window["fetch"];
    /** Gets info to display in toast notification. */
    toast?: (response: Response) => { title: string };
};

function setCookie(name: string, token: string, expires: string): void {
    const cookieValue = `${encodeURIComponent(name)}=${encodeURIComponent(token)}; Path=/; SameSite=Lax; Secure; Expires=${expires}`;
    document.cookie = cookieValue;
}

const getCookie = (name: string): string | undefined => {
    return document.cookie
        .split("; ")
        .find(row => row.startsWith(`${name}=`))
        ?.split("=")[1];
};
