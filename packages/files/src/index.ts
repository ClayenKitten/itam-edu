import { createConfigFromEnv } from "itam-edu-common/config";
import logger from "./logger";
import { CookieMap, env } from "bun";

const config = createConfigFromEnv();
const baseUrl = env.ITAMEDU_PUBLIC_API_URL_SERVER;

Bun.serve({
    hostname: "0.0.0.0",
    port: config.server.ports.files,

    async fetch(req) {
        logger.debug("HTTP Request", { method: req.method, url: req.url });

        if (req.method !== "GET") {
            return new Response(null, { status: 405 });
        }

        const filePath = new URL(req.url).pathname;
        const apiURL = baseUrl + "/files" + filePath;

        const apiHeaders = new Headers();
        const token = getTokenFromRequest(req);
        if (token) apiHeaders.set("Authorization", token);

        const apiResp = await fetch(apiURL, {
            method: "GET",
            headers: apiHeaders,
            redirect: "manual"
        });

        if (apiResp.status === 404) {
            return new Response("Requested file was not found", {
                status: 404
            });
        }

        if (apiResp.status < 300 || apiResp.status >= 400) {
            logger.debug("Non-redirect response from API", {
                file: filePath,
                userId: apiResp.headers.get("x-user-id"),
                requestedRange: req.headers.get("range"),
                status: apiResp.status
            });
            const passthrough = new Response(apiResp.body, apiResp);
            passthrough.headers.append("Via", "itam-edu-files");
            return passthrough;
        }

        const location = apiResp.headers.get("Location");
        if (!location) {
            return new Response("Missing redirect location from API", {
                status: 502
            });
        }

        const s3Headers = new Headers();

        // Forward only headers relevant to caching/ranges/data
        // Critically: DO NOT forward Authorization/Cookie/etc to S3
        // S3 will validate via the presigned query string, not headers.
        copyHeaderIfPresent(req.headers, s3Headers, "range");
        copyHeaderIfPresent(req.headers, s3Headers, "if-range");
        copyHeaderIfPresent(req.headers, s3Headers, "if-none-match");
        copyHeaderIfPresent(req.headers, s3Headers, "if-modified-since");
        copyHeaderIfPresent(req.headers, s3Headers, "if-match");
        copyHeaderIfPresent(req.headers, s3Headers, "if-unmodified-since");
        copyHeaderIfPresent(req.headers, s3Headers, "accept");
        copyHeaderIfPresent(req.headers, s3Headers, "accept-encoding");

        const s3Resp = await fetch(location, {
            method: req.method,
            headers: s3Headers
        });

        logger.debug("File sent", {
            file: filePath,
            userId: apiResp.headers.get("x-user-id"),
            requestedRange: req.headers.get("range"),
            contentLength: s3Resp.headers.get("content-length"),
            contentRange: s3Resp.headers.get("content-range"),
            status: s3Resp.status
        });
        const out = new Response(s3Resp.body, s3Resp);
        out.headers.append("Via", "itam-edu-files");
        return out;
    }
});

function copyHeaderIfPresent(from: Headers, to: Headers, name: string) {
    const v = from.get(name);
    if (v) to.set(name, v);
}

export function getTokenFromRequest(request: Request): string | null {
    let token = request.headers.get("authorization");
    if (!token) {
        const cookies = request.headers.get("cookie");
        if (!cookies) return null;
        token = new CookieMap(cookies).get("itam-edu-token");
    }
    return token;
}
