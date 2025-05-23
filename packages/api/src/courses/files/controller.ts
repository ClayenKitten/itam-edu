import { injectable } from "inversify";
import Elysia, { t } from "elysia";
import { authenticationPlugin } from "../../api/plugins/authenticate";
import { randomUUID } from "crypto";
import { REQUIRE_TOKEN } from "../../api/plugins/docs";
import { UserRepository } from "../../users/repository";
import { S3 } from "../../infra/s3";

@injectable()
export class FileController {
    public constructor(
        protected userRepo: UserRepository,
        protected s3: S3
    ) {}

    public toElysia() {
        return new Elysia({ tags: ["Files"] })
            .use(authenticationPlugin(this.userRepo))
            .get(
                "/courses/:course/files/:file",
                async ({ params }) => {
                    const path = `/courses/${params.course}/${params.file}`;
                    return new Response(await this.s3.download(path));
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
                async ({ user, body, params, status }) => {
                    if (
                        !user.hasCoursePermission(
                            params.course,
                            "canEditContent"
                        )
                    ) {
                        return status(403);
                    }

                    const extension = body.file.name.split(".").pop();
                    const id = randomUUID();
                    const filename = `${id}.${extension}`;
                    const path = `/courses/${params.course}/${filename}`;
                    await this.s3.upload(path, body.file);

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
