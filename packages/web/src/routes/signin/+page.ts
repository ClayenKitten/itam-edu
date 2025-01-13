import { redirect } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ url }) => {
    const code = getCode(url);

    const redirectTarget = getRedirect(url);
    if (redirectTarget.invalid) {
        redirect(307, url.pathname + code ? `?code=${code}` : "");
    }

    return { redirect: redirectTarget.value, code };
};

const getCode = (url: URL): string | null => {
    return url.searchParams.get("code");
};

const getRedirect = (
    url: URL
): { value: string; invalid: false } | { value: null; invalid: true } => {
    const redirectTargetRaw = url.searchParams.get("redirect");
    if (!redirectTargetRaw) return { value: "/", invalid: false };
    const redirectTarget = decodeURIComponent(redirectTargetRaw);
    if (!redirectTarget.startsWith("/")) return { value: null, invalid: true };
    return { value: redirectTarget, invalid: false };
};
