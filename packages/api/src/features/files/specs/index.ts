export abstract class FileSpec {
    public constructor(
        /** Maximum file size in bytes. */
        public readonly maxSize: number
    ) {}

    public abstract get path(): string[];
}

export const MEGABYTE = 1048576;

export abstract class ImageSpec extends FileSpec {
    public constructor(
        public readonly dimensions: ImageDimensions,
        public readonly maxSize: number = 1 * MEGABYTE
    ) {
        super(maxSize);
    }

    public static readonly EXTENSIONS = [
        "png",
        "jpg",
        "jpeg",
        "webp",
        "gif",
        "avif"
    ] as const;
}

/** Size of the image. */
export type ImageDimensions = {
    /** Width in pixels. */
    width: number;
    /** Height in pixels. */
    height: number;
};

export abstract class VideoSpec extends FileSpec {
    public constructor(public readonly maxSize: number) {
        super(maxSize);
    }

    public static readonly EXTENSIONS = ["mp4"] as const;
}
