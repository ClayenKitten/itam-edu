import { inject, injectable } from "inversify";
import { S3Client } from "bun";
import type { AppConfig } from "itam-edu-common/config";

/** S3 client. */
@injectable()
export class S3 {
    public constructor(
        @inject("AppConfig")
        protected config: AppConfig
    ) {
        this.client = new S3Client({
            endpoint: config.s3.endpoint,
            accessKeyId: config.s3.accessKey,
            secretAccessKey: config.s3.secretKey,
            bucket: config.s3.bucket
        });
    }

    protected client: S3Client;

    /** Returns readable stream of the path. */
    public async download(path: string): Promise<ReadableStream> {
        return this.client.file(path).stream();
    }

    /** Uploads a blob to the path. */
    public async upload(path: string, file: Blob): Promise<void> {
        await this.client.write(path, file);
    }
}
