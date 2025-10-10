import sharp from "sharp";
import { AppError } from "../../../errors";
import { ImageSpec, type FileSpec } from "../specs";
import { S3 } from "../../../infra/s3";
import { injectable } from "inversify";

/**
 * Service that handles file uploads.
 *
 * Handles file processing, renaming and uploading to S3. Authorization must be handled beforehand.
 * */
@injectable()
export class UploadService {
    public constructor(private s3: S3) {}

    public async uploadBlob(spec: FileSpec, blob: Blob): Promise<UploadResult> {
        if (blob.size > spec.maxSize) {
            throw new AppError(
                "upload-too-large",
                `Размер файла "${`/${spec.path.join("/")}`}" не должен превышать ${Math.floor(spec.maxSize / 1024 / 102.4) / 10} MiB, получено ${Math.floor(blob.size / 1024 / 102.4) / 10} MiB.`,
                {
                    httpCode: 413
                }
            );
        }

        if (spec instanceof ImageSpec) {
            const imgBuffer = await blob.bytes();
            const pngBuffer = await sharp(imgBuffer, {})
                .resize(spec.dimensions.width, spec.dimensions.height, {
                    fit: "cover"
                })
                .png()
                .toBuffer();
            const newPath = this.setExtension(spec.path, "png");
            const pathStr = `/${newPath.join("/")}`;
            const pngBlob = new Blob([pngBuffer], { type: "image/png" });

            await this.s3.upload(pathStr, pngBlob);
            return { path: pathStr };
        } else {
            const pathStr = `/${spec.path.join("/")}`;
            await this.s3.upload(pathStr, blob);
            return { path: pathStr };
        }
    }

    private setExtension(path: string[], extension: string): string[] {
        if (path.length === 0) return path;
        const parts = [...path];
        const base = parts[parts.length - 1]!.replace(/\.[^.]+$/, "");
        parts[parts.length - 1] = `${base}.${extension}`;
        return parts;
    }
}

export type UploadResult = {
    path: string;
};
