import Elysia, { t } from "elysia";
import type { AppContext } from "../ctx";
import { authenticationPlugin } from "../api/plugins/authenticate";
import { randomUUID } from "crypto";
import { S3Client } from "bun";
import { env } from "process";
import { REQUIRE_TOKEN } from "../api/plugins/docs";

export async function filesController(ctx: AppContext) {
    return new Elysia()
        .derive(() => ctx)
        .derive(() => ({
            // TODO: extract into the service
            s3client: new S3Client({
                bucket: env.ITAM_EDU_S3_PROXY_BUCKET!,
                endpoint:
                    (!(env.ITAM_EDU_S3_PROXY_SSL! === "false")
                        ? "https"
                        : "http") +
                    "://" +
                    env.ITAM_EDU_S3_PROXY_ENDPOINT! +
                    ":" +
                    env.ITAM_EDU_S3_PROXY_PORT!,
                accessKeyId: env.ITAM_EDU_S3_PROXY_ACCESS_KEY!,
                secretAccessKey: env.ITAM_EDU_S3_PROXY_SECRET_KEY!
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
