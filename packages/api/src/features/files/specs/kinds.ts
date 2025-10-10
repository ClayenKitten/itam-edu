// TODO: these specs should be defined in their respective feature slices.

import type { UUID } from "crypto";
import { match, uuid } from "./dsl";
import { FileSpec, ImageSpec, MEGABYTE, VideoSpec } from ".";

export function parseFileSpec(path: ReadonlyArray<string>): FileSpec | null {
    return (
        UserAvatar.parse(path) ??
        LessonCover.parse(path) ??
        LessonVideo.parse(path) ??
        CourseCover.parse(path) ??
        CourseBanner.parse(path) ??
        CourseIcon.parse(path) ??
        null
    );
}

/** User avatar image. */
export class UserAvatar extends ImageSpec {
    public constructor(public readonly userId: UUID) {
        super({ width: 512, height: 512 });
    }

    public static parse(path: ReadonlyArray<string>): UserAvatar | null {
        const matched = match(path, {
            pattern: ["users", uuid],
            name: "avatar",
            extensions: ImageSpec.EXTENSIONS
        });
        if (!matched) return null;
        return new UserAvatar(matched.ids[0]!);
    }

    public get path(): string[] {
        return ["users", this.userId, "avatar.png"];
    }
}

/** Course cover image. */
export class CourseCover extends ImageSpec {
    public constructor(public readonly courseId: UUID) {
        super({ width: 315, height: 315 });
    }

    public static parse(path: ReadonlyArray<string>): CourseCover | null {
        const matched = match(path, {
            pattern: ["courses", uuid],
            name: "cover",
            extensions: ImageSpec.EXTENSIONS
        });
        if (!matched) return null;
        return new CourseCover(matched.ids[0]!);
    }

    public get path(): string[] {
        return ["courses", this.courseId, "cover.png"];
    }
}
/** Course icon. */
export class CourseIcon extends ImageSpec {
    public constructor(public readonly courseId: UUID) {
        super({ width: 128, height: 128 });
    }

    public static parse(path: ReadonlyArray<string>): CourseIcon | null {
        const matched = match(path, {
            pattern: ["courses", uuid],
            name: "icon",
            extensions: ImageSpec.EXTENSIONS
        });
        if (!matched) return null;
        return new CourseIcon(matched.ids[0]!);
    }

    public get path(): string[] {
        return ["courses", this.courseId, "icon.png"];
    }
}
/** Course banner image. */
export class CourseBanner extends ImageSpec {
    public constructor(public readonly courseId: UUID) {
        super({ width: 1600, height: 320 });
    }

    public static parse(path: ReadonlyArray<string>): CourseBanner | null {
        const matched = match(path, {
            pattern: ["courses", uuid],
            name: "banner",
            extensions: ImageSpec.EXTENSIONS
        });
        if (!matched) return null;
        return new CourseBanner(matched.ids[0]!);
    }

    public get path(): string[] {
        return ["courses", this.courseId, "banner.png"];
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
        const matched = match(path, {
            pattern: ["courses", uuid, "lessons", uuid],
            name: "cover",
            extensions: ImageSpec.EXTENSIONS
        });
        if (!matched) return null;
        return new LessonCover(matched.ids[0]!, matched.ids[1]!);
    }

    public get path(): string[] {
        return [
            "courses",
            this.courseId,
            "lessons",
            this.lessonId,
            "cover.png"
        ];
    }
}
/** Lesson video. */
export class LessonVideo extends VideoSpec {
    public constructor(
        public readonly courseId: UUID,
        public readonly lessonId: UUID
    ) {
        super(1024 * MEGABYTE);
    }

    public static parse(path: ReadonlyArray<string>): LessonVideo | null {
        const matched = match(path, {
            pattern: ["courses", uuid, "lessons", uuid],
            name: "video",
            extensions: VideoSpec.EXTENSIONS
        });
        if (!matched) return null;
        return new LessonVideo(matched.ids[0]!, matched.ids[1]!);
    }

    public get path(): string[] {
        return [
            "courses",
            this.courseId,
            "lessons",
            this.lessonId,
            "video.mp4"
        ];
    }
}
