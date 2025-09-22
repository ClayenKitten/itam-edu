import { handle } from "$lib/server/handle";
import { handleFetch } from "$lib/server/handle-fetch";
import type { ServerInit } from "@sveltejs/kit";

export { handle, handleFetch };

export const init: ServerInit = async () => {
    if (process.env.ITAMEDU_FRONTEND_PORT) {
        process.env.PORT = process.env.ITAMEDU_FRONTEND_PORT;
    }
    process.env.ORIGIN = process.env.ITAMEDU_ORIGIN;
    process.env.HOST = "0.0.0.0";
};
