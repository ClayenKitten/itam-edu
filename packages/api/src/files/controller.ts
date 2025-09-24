import { injectable } from "inversify";
import Elysia, { t } from "elysia";
import { AuthenticationPlugin } from "../api/plugins/authenticate";
import { randomUUID } from "crypto";
import { REQUIRE_TOKEN } from "../api/plugins/docs";
import { PresignDownloadUrl } from "./presign-download.interactor";
import { UploadFile } from "./upload.interactor";
import { HttpError } from "../api/errors";

@injectable()
export class FileController {
    public constructor(
        private authPlugin: AuthenticationPlugin,
        private presignDownloadInteractor: PresignDownloadUrl,
        private uploadInteractor: UploadFile
    ) {}

    public toElysia() {
        return new Elysia({ tags: ["Files"], prefix: "/files" })
            .use(this.authPlugin.toElysia())
            .get(
                "/*",
                async ({ user, params, status, redirect }) => {
                    const path = params["*"].split("/");
                    const result = await this.presignDownloadInteractor.invoke(
                        user,
                        path
                    );
                    if (result instanceof HttpError) {
                        return status(result.code, result.message);
                    }
                    return redirect(result, 307);
                },
                {
                    detail: {
                        summary: "Download file",
                        description:
                            "Returns redirect to presigned download URL of the file."
                    }
                }
            )
            .post(
                "/*",
                async ({ user, params, status, body }) => {
                    const path = params["*"].split("/");
                    const result = await this.uploadInteractor.invoke(
                        user,
                        path,
                        body.file
                    );
                    if (result instanceof HttpError) {
                        return status(result.code, result.message);
                    }
                    return { filename: result };
                },
                {
                    requireAuthentication: true,
                    body: t.Object({
                        file: t.File({
                            description: "File to upload."
                        })
                    }),
                    detail: {
                        summary: "Upload file",
                        description: "Uploads file to the S3 storage.",
                        security: REQUIRE_TOKEN
                    }
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
