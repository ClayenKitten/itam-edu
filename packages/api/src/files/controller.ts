import { inject, injectable } from "inversify";
import Elysia, { t } from "elysia";
import { authenticationPlugin } from "../api/plugins/authenticate";
import { randomUUID } from "crypto";
import { S3Client } from "bun";
import { REQUIRE_TOKEN } from "../api/plugins/docs";
import { AppConfig } from "../config";
import { UserRepository } from "../users/repository";

@injectable()
export class FileController {
    public constructor(
        protected config: AppConfig,
        protected userRepo: UserRepository
    ) {}

    public toElysia() {
        // TODO: extract into the service
        return new Elysia({ tags: ["Files"] })
            .use(authenticationPlugin(this.userRepo))
            .derive(() => {
                let endpoint =
                    (this.config.s3.useSSL ? "https" : "http") +
                    "://" +
                    this.config.s3.endpoint;
                if (this.config.s3.port) endpoint += `:${this.config.s3.port}`;
                return {
                    s3client: new S3Client({
                        endpoint,
                        accessKeyId: this.config.s3.accessKey,
                        secretAccessKey: this.config.s3.secretKey,
                        bucket: this.config.s3.bucket
                    })
                };
            })
            .get(
                "/courses/:course/files/:file",
                async ({ s3client, params }) => {
                    const path = `/courses/${params.course}/${params.file}`;
                    return new Response(s3client.file(path).stream());
                },
                {
                    detail: {
                        summary: "Get file",
                        description: "Returns a requested course file"
                    }
                }
            )
            .post(
                "/courses/:course/files",
                async ({ user, s3client, body, params, error }) => {
                    if (
                        !user.hasCoursePermission(
                            params.course,
                            "canEditContent"
                        )
                    )
                        return error(403);

                    const extension = body.file.name.split(".").pop();
                    const id = randomUUID();
                    const filename = `${id}.${extension}`;
                    const path = `/courses/${params.course}/${filename}`;

                    await s3client.write(path, body.file);

                    return { filename };
                },
                {
                    requireAuthentication: true,
                    body: t.Object({
                        file: t.File({
                            type: [
                                "image/png",
                                "image/jpeg",
                                "video/mp4",
                                "video/mpeg",
                                "video/webm"
                            ],
                            maxSize: "1024m",
                            description: "File to upload"
                        })
                    }),
                    detail: {
                        summary: "Upload file",
                        description: "Uploads a new file to the course",
                        security: REQUIRE_TOKEN
                    }
                }
            );
    }
}
