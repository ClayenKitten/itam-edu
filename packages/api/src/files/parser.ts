import {
    LessonCover,
    LessonVideo,
    UserAvatar,
    CourseBanner,
    CourseCover,
    CourseIcon,
    FileSpec
} from "./specs";

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
