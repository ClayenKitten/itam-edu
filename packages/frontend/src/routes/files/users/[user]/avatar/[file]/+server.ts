import type { RequestHandler } from "./$types";
import { S3Client } from "../../../../s3.server";

export const GET: RequestHandler = async ({ request, params }) => {
    return await new S3Client().proxy(
        `/users/${params.user}/avatar/${params.file}`,
        request
    );
};
