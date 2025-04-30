import Elysia, { t } from "elysia";
import type { AppContext } from "../ctx";
import { authenticationPlugin } from "../api/plugins/authenticate";
import { randomUUID } from "crypto";
import { S3Client } from "bun";
import { REQUIRE_TOKEN } from "../api/plugins/docs";

export async function filesController(ctx: AppContext) {
    return new Elysia()
        .derive(() => ctx)
        .derive(({ config }) => ({
            // TODO: extract into the service
            s3client: new S3Client({
                endpoint:
                    (config.s3.useSSL ? "https" : "http") +
                    "://" +
                    config.s3.endpoint +
                    ":" +
                    config.s3.port,
                accessKeyId: config.s3.accessKey,
                secretAccessKey: config.s3.secretKey,
                bucket: config.s3.bucket
            })
        }))
        .use(authenticationPlugin(ctx))
        .get(
            "/courses/:course/files/:file",
            async ({ s3client, params }) => {
                const path = `/courses/${params.course}/${params.file}`;
                return new Response(s3client.file(path).stream());
            },
            {
                detail: {
                    summary: "Get file",
                    description: "Returns a requested course file",
                    tags: ["Courses", "Files"]
                }
            }
        )
        .post(
            "/courses/:course/files",
            async ({ user, s3client, body, params, error }) => {
                if (!user.hasCoursePermission(params.course, "canEditContent"))
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
                    tags: ["Courses", "Files"],
                    security: REQUIRE_TOKEN
                }
            }
        );
}
