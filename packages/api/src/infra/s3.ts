import { injectable } from "inversify";
import { AppConfig } from "../config";
import { S3Client } from "bun";

/** S3 client. */
@injectable()
export class S3 {
    public constructor(protected config: AppConfig) {
        let endpoint =
            (config.s3.useSSL ? "https" : "http") + "://" + config.s3.endpoint;
        if (config.s3.port) endpoint += `:${config.s3.port}`;
        this.client = new S3Client({
            endpoint,
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
