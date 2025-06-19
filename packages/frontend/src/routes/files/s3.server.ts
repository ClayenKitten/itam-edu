import { env } from "$env/dynamic/private";
import * as Minio from "minio";

export class S3Client {
    public constructor() {
        const url = new URL(env.ITAMEDU_S3_ENDPOINT!);
        if (!cache) {
            cache = new Minio.Client({
                endPoint: url.hostname,
                port: url.port ? Number(url.port) : undefined,
                useSSL: url.protocol !== "http:",
                accessKey: env.ITAMEDU_S3_ACCESS_KEY!,
                secretKey: env.ITAMEDU_S3_SECRET_KEY!
            });
        }
        this.client = cache;
    }

    private client: Minio.Client;

    /**
     * Proxies request to S3 server.
     *
     * Thanks to proxying, caching, ranges and other headers are handled by S3 server automatically.
     * */
    // TODO: authorization
    public async proxy(fileName: string, request: Request): Promise<Response> {
        // Presigned URL expects internal `Host` header (e.g. minio:9000), but
        // request will probably be sent to public hostname of the api server.
        request.headers.delete("Host");

        const url = await this.client.presignedGetObject(
            env.ITAMEDU_S3_BUCKET!,
            fileName
        );
        return await fetch(url, { headers: request.headers });
    }
}

let cache: Minio.Client | null = null;
