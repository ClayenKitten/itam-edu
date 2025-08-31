import type { PageLoad } from "./$types";
import api from "$lib/api";
import { error } from "@sveltejs/kit";

export const load: PageLoad = async ({ fetch, params, depends }) => {
    depends("app:call");

    const call = await getCall(fetch, params.call);

    return { call, title: `${call.title} | ITAM Education` };
};

async function getCall(fetch: typeof window.fetch, call: string) {
    const response = await api({ fetch }).calls({ call }).get();
    if (response.error) error(response.status);
    return response.data;
}
