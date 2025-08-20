import { injectable } from "inversify";
import Elysia, { t } from "elysia";
import { AuthenticationPlugin } from "../api/plugins/authenticate";
import { randomUUID } from "crypto";
import { REQUIRE_TOKEN } from "../api/plugins/docs";
import { S3 } from "../infra/s3";
import { FileAuthorizer } from "./file-authorizer";

@injectable()
export class FileController {
    public constructor(
        protected authPlugin: AuthenticationPlugin,
        protected s3: S3,
        protected authorizer: FileAuthorizer
    ) {}

    public toElysia() {
        return new Elysia({ tags: ["Files"], prefix: "/files" })
            .use(this.authPlugin.toElysia())
            .get(
                "/courses/:course/:file",
                async ({ user, params, status, redirect }) => {
                    if (
                        !this.authorizer.canDownloadCourseFile(
                            user,
                            params.course,
                            params.file
                        )
                    )
                        return status(403);
                    const url = await this.s3.signUrl(
                        `/courses/${params.course}/${params.file}`,
                        "GET"
                    );
                    return redirect(url, 307);
                },
                {
                    detail: {
                        summary: "Download course file",
                        description: "Returns redirect to signed download URL",
                        security: REQUIRE_TOKEN
                    }
                }
            )
            .post(
                "/courses/:course",
                async ({ user, params, status, body }) => {
                    if (
                        !this.authorizer.canUploadCourseFile(
                            user,
                            params.course,
                            body.file.name
                        )
                    )
                        return status(403);

                    const filename = this.cleanupFilename(body.file.name);
                    await this.s3.upload(
                        `/courses/${params.course}/${filename}`,
                        body.file
                    );
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
                        summary: "Upload course file",
                        description: "Uploads course file to the S3 storage.",
                        security: REQUIRE_TOKEN
                    }
                }
            )
            .get(
                "/users/:user/avatar/:file",
                async ({ user, params, status, redirect }) => {
                    if (
                        !this.authorizer.canDownloadUserAvatar(
                            user,
                            params.user
                        )
                    )
                        return status(403);

                    const url = await this.s3.signUrl(
                        `/users/${params.user}/avatar/${params.file}`,
                        "GET"
                    );
                    return redirect(url, 307);
                }
            );
    }

    /** Replaces filename with a randomly generated one, leaving extension intact. */
    protected cleanupFilename(filename: string): string {
        const extension = filename.split(".").pop();
        const name = randomUUID();
        return `${name}.${extension}`;
    }
}
