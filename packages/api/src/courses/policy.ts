import type { Course } from "./entity";
import type { User, CoursePermissions } from "itam-edu-common";

/** Returns {@link CoursePermissions}, or null if course is not accessible to the user. */
export function coursePermissions(
    user: User | null,
    course: Course
): CoursePermissions | null {
    const courseRole =
        user?.courses.find(c => c.id === course.id)?.role ?? null;

    const viewLevel = getViewLevel();
    const editLevel = getEditLevel();

    if (viewLevel === ViewLevel.None) return null;

    return {
        course: {
            update: editLevel >= EditLevel.Admin,
            publish: editLevel === EditLevel.Owner,
            archive: editLevel === EditLevel.Owner,
            toggleEnrollment: editLevel === EditLevel.Owner
        },
        lessons: {
            edit: editLevel >= EditLevel.Teacher
        },
        homeworks: {
            edit: editLevel >= EditLevel.Teacher
        },
        submissions: {
            view: viewLevel === ViewLevel.Full,
            create: editLevel === EditLevel.Student,
            review: editLevel >= EditLevel.Teacher
        },
        staff: {
            manage: editLevel === EditLevel.Owner
        },
        students: {
            view: viewLevel === ViewLevel.Full,
            remove: editLevel >= EditLevel.Admin
        },
        analytics: {
            view: viewLevel === ViewLevel.Full
        },
        calls: {
            start: editLevel >= EditLevel.Teacher,
            stop: editLevel >= EditLevel.Teacher
        }
    };

    function getViewLevel(): ViewLevel {
        if (user?.info.role === "supervisor" || user?.info.role === "admin") {
            return ViewLevel.Full;
        }

        switch (courseRole) {
            case "admin":
            case "teacher":
                return ViewLevel.Full;
            case "student":
            case null:
                return course.info.isPublished
                    ? ViewLevel.Basic
                    : ViewLevel.None;
            default:
                let guard: never = courseRole;
                return ViewLevel.None;
        }
    }

    function getEditLevel(): EditLevel {
        if (user?.info.role === "supervisor" || user?.info.role === "admin") {
            return EditLevel.Owner;
        }
        if (course.info.isArchived) {
            // Note: Supervisors and admins bypass limitations of archived courses
            return EditLevel.None;
        }

        switch (courseRole) {
            case "admin":
                return EditLevel.Admin;
            case "teacher":
                return EditLevel.Teacher;
            case "student":
                return course.info.isPublished
                    ? EditLevel.Student
                    : EditLevel.None;
            case null:
                return EditLevel.None;
            default:
                let guard: never = courseRole;
                return EditLevel.None;
        }
    }
}

/**
 * Broadly defines how much information is available to the user.
 *
 * Permissions may provide exceptions or additional conditions to these levels.
 * */
const enum ViewLevel {
    None = 0,
    Basic = 1,
    Full = 2
}

/**
 * Broadly defines how much information may be changed by the user.
 *
 * Permissions may provide exceptions or additional conditions to these levels.
 * */
const enum EditLevel {
    None = 0,
    Student = 1,
    Teacher = 2,
    Admin = 3,
    Owner = 4
}
