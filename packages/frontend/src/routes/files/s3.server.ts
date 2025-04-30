import { env } from "$env/dynamic/private";
import * as Minio from "minio";

export class S3Client {
    public constructor() {
        if (!cache) {
            cache = new Minio.Client({
                endPoint: env.ITAM_EDU_S3_PROXY_ENDPOINT!,
                port: Number(env.ITAM_EDU_S3_PROXY_PORT!),
                useSSL: !(env.ITAM_EDU_S3_PROXY_SSL! === "false"),
                accessKey: env.ITAM_EDU_S3_PROXY_ACCESS_KEY!,
                secretKey: env.ITAM_EDU_S3_PROXY_SECRET_KEY!
            });
        }
        this.client = cache;
    }

    private client: Minio.Client;

    /**
     * Proxies request to S3 server.
     *
     * Thanks to proxying, caching, ranges and other headers are hanlded by S3 server automatically.
     * */
    // TODO: authorization
    public async proxy(fileName: string, request: Request): Promise<Response> {
        // Presigned URL expects internal `Host` header (e.g. minio:9000), but
        // request will probably be sent to public hostname of the api server.
        request.headers.delete("Host");

        const url = await this.client.presignedGetObject("files", fileName);
        return await fetch(url, { headers: request.headers });
    }
}

let cache: Minio.Client | null = null;
