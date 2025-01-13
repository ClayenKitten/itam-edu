import api from "$lib/api";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

/**
 * Proxy to sign in endpoint.
 *
 * Used to set token cookie while bypassing `SameSite` restrictions.
 * */
export const POST: RequestHandler = async ({ fetch, cookies, url }) => {
    const query = /\^?code\=([A-Z0-9]+)$/.exec(url.search);
    if (!query) return new Response("Bad Request", { status: 400 });
    const code = query[1]!;

    const loginResp = await api({
        fetch,
        enableDefaultCatch: false
    }).users.me.session.$post({
        json: { code }
    });
    if (loginResp.status !== 200) {
        return new Response(loginResp.statusText, { status: loginResp.status });
    }
    const { token, expires } = await loginResp.json();

    cookies.set("itam-edu-token", token, {
        path: "/",
        sameSite: "lax",
        secure: true,
        httpOnly: true,
        expires: new Date(expires)
    });

    return new Response();
};
