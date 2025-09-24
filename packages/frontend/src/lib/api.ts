import { env } from "$env/dynamic/public";
import { treaty } from "@elysiajs/eden";
import type { ApiTreaty } from "itam-edu-api/src/api";

export default function api(params: ApiParams) {
    const baseUrl = env.ITAMEDU_PUBLIC_API_URL_BROWSER!;

    const client = treaty<ApiTreaty>(baseUrl, {
        fetcher: params.fetch
    });
    return client;
}

export class UploadClient {
    public constructor(private params: ApiParams) {}

    public async uploadAvatar(userId: string, file: File): Promise<string> {
        const filename = replaceName(file.name, "avatar");
        return await this.upload(
            `${this.BASE_URL}/users/${userId}/${filename}`,
            file
        );
    }

    public async uploadCourseFile(
        courseId: string,
        kind: "cover" | "icon" | "banner",
        file: File
    ): Promise<string> {
        const filename = replaceName(file.name, kind);
        return await this.upload(
            `${this.BASE_URL}/courses/${courseId}/${filename}`,
            file
        );
    }

    public async uploadLessonFile(
        courseId: string,
        lessonId: string,
        kind: "cover" | "video",
        file: File
    ): Promise<string> {
        const filename = replaceName(file.name, kind);
        return await this.upload(
            `${this.BASE_URL}/courses/${courseId}/lessons/${lessonId}/${filename}`,
            file
        );
    }

    /**
     * Uploads a file and returns filename.
     *
     * @throws {UploadError} if backend replies with non-ok status code.
     */
    private async upload(path: string, file: File): Promise<string> {
        const formData = new FormData();
        formData.append("file", file);
        const response = await this.params.fetch(path, {
            method: "POST",
            body: formData
        });
        if (!response.ok) {
            throw new UploadError();
        }
        const { filename }: { filename: string } = await response.json();
        return filename;
    }

    private readonly BASE_URL = "/api/files";
}

export class UploadError extends Error {
    public constructor() {
        super("Failed to upload file.");
    }
}

type ApiParams = {
    fetch: typeof fetch;
};

/** Replaces file name, while keeping the extension. */
function replaceName(originalName: string, newName: string): string {
    const extension = originalName.split(".").pop();
    return extension !== undefined ? `${newName}.${extension}` : newName;
}
