import { Logger } from "itam-edu-core/logger";
import { createConfigFromEnv } from "itam-edu-core/config";
import { CookieMap, env } from "bun";

const logger = new Logger();
const config = createConfigFromEnv();

Bun.serve({
    hostname: "0.0.0.0",
    port: config.server.ports.files,

    async fetch(req) {
        logger.debug("HTTP Request", { method: req.method, url: req.url });

        if (req.method !== "GET") {
            return new Response(null, { status: 405 });
        }

        let url = baseUrl + "/files" + new URL(req.url).pathname;

        // Presigned URL may expect internal `Host` header (e.g. minio:9000), which may not match
        // if request was sent to public hostname, therefore triggering CORS protection.
        req.headers.delete("Host");

        const token = getTokenFromRequest(req);
        if (token) req.headers.set("Authorization", token);

        const response = await fetch(url, {
            headers: req.headers,
            method: req.method,
            body: req.body,
            // Backend is expected to reply with redirect.
            redirect: "follow"
        });
        if (response.status == 404) {
            return new Response("Requested file was not found", {
                status: 404
            });
        }
        response.headers.append("Via", "itam-edu-files");
        return response;
    }
});
logger.info("Started file server", { port: config.server.ports.files });

export function getTokenFromRequest(request: Request): string | null {
    let token = request.headers.get("authorization");
    if (!token) {
        let cookies = request.headers.get("cookie");
        if (!cookies) return null;
        token = new CookieMap(cookies).get("itam-edu-token");
    }
    return token;
}

export const baseUrl = env.ITAMEDU_PUBLIC_API_URL_SERVER;
