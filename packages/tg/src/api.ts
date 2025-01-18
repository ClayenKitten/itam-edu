import { treaty } from "@elysiajs/eden";
import type { AppType } from "itam-edu-api";
import { env } from "process";

export default function api() {
    const baseUrl = env.ITAM_EDU_TG_API_URL!;
    const token = env.ITAM_EDU_TG_API_TOKEN!;

    return treaty<AppType>(baseUrl, {
        fetcher: fetch,
        headers: { Authorization: `Bearer ${token}` }
    });
}
