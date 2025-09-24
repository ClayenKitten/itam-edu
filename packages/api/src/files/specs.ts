import type { UUID } from "crypto";
import { match, uuid } from "./dsl";

export abstract class FileSpec {}

export abstract class ImageSpec extends FileSpec {
    public constructor(public readonly size: ImageSize) {
        super();
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
export type ImageSize = {
    /** Width in pixels. */
    width: number;
    /** Height in pixels. */
    height: number;
};

export abstract class VideoSpec extends FileSpec {
    public static readonly EXTENSIONS = ["mp4", "webm"] as const;
}

/** User avatar image. */
export class UserAvatar extends ImageSpec {
    public constructor(public readonly userId: UUID) {
        super({ width: 512, height: 512 });
    }

    public static parse(path: ReadonlyArray<string>): UserAvatar | null {
        const matched = match(
            path,
            ["users", uuid],
            "avatar",
            ImageSpec.EXTENSIONS
        );
        if (!matched) return null;
        return new UserAvatar(matched.ids[0]!);
    }
}

/** Course cover image. */
export class CourseCover extends ImageSpec {
    public constructor(public readonly courseId: UUID) {
        super({ width: 315, height: 315 });
    }

    public static parse(path: ReadonlyArray<string>): CourseCover | null {
        const matched = match(
            path,
            ["courses", uuid],
            "cover",
            ImageSpec.EXTENSIONS
        );
        if (!matched) return null;
        return new CourseCover(matched.ids[0]!);
    }
}
/** Course icon. */
export class CourseIcon extends ImageSpec {
    public constructor(public readonly courseId: UUID) {
        super({ width: 64, height: 64 });
    }

    public static parse(path: ReadonlyArray<string>): CourseIcon | null {
        const matched = match(
            path,
            ["courses", uuid],
            "icon",
            ImageSpec.EXTENSIONS
        );
        if (!matched) return null;
        return new CourseIcon(matched.ids[0]!);
    }
}
/** Course banner image. */
export class CourseBanner extends ImageSpec {
    public constructor(public readonly courseId: UUID) {
        super({ width: 1600, height: 320 });
    }

    public static parse(path: ReadonlyArray<string>): CourseBanner | null {
        const matched = match(
            path,
            ["courses", uuid],
            "banner",
            ImageSpec.EXTENSIONS
        );
        if (!matched) return null;
        return new CourseBanner(matched.ids[0]!);
    }
}

/** Lesson cover image. */
export class LessonCover extends ImageSpec {
    public constructor(
        public readonly courseId: UUID,
        public readonly lessonId: UUID
    ) {
        super({ width: 330, height: 200 });
    }

    public static parse(path: ReadonlyArray<string>): LessonCover | null {
        const matched = match(
            path,
            ["courses", uuid, "lessons", uuid],
            "cover",
            ImageSpec.EXTENSIONS
        );
        if (!matched) return null;
        return new LessonCover(matched.ids[0]!, matched.ids[1]!);
    }
}
/** Lesson video. */
export class LessonVideo extends VideoSpec {
    public constructor(
        public readonly courseId: UUID,
        public readonly lessonId: UUID
    ) {
        super();
    }

    public static parse(path: ReadonlyArray<string>): LessonVideo | null {
        const matched = match(
            path,
            ["courses", uuid, "lessons", uuid],
            "video",
            VideoSpec.EXTENSIONS
        );
        if (!matched) return null;
        return new LessonVideo(matched.ids[0]!, matched.ids[1]!);
    }
}
