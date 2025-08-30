export type GlobalRole = "default" | "supervisor" | "admin";
export type GlobalPermissions = {
    createCourses: boolean;
};

export type CourseRole = "student" | "teacher" | "admin";
export type CoursePermissions = {
    course: {
        /** Edit main information of the course: title, description, etc. */
        update: boolean;
        /** Publish or unpublish course. */
        publish: boolean;
        /** Archive or unarchive course. */
        archive: boolean;
        /** Enable or disable student enrollment. */
        toggleEnrollment: boolean;
    };
    lessons: {
        /** Create, update, delete and reorder lessons. */
        edit: boolean;
    };
    homeworks: {
        /** Create, update, delete and reorder homeworks. */
        edit: boolean;
    };
    submissions: {
        /** View homework submissions of other students. */
        view: boolean;
        /** Create homework submissions. */
        create: boolean;
        /** Review homework submissions of other students. */
        review: boolean;
    };
    staff: {
        /** Invite, promote and remove staff members. */
        manage: boolean;
    };
    students: {
        /** View course students. */
        view: boolean;
        /** Remove students from the course. */
        remove: boolean;
    };
    attendance: {
        /** View attendance. */
        view: boolean;
        /** Add or remove students from the attendance record. */
        edit: boolean;
    };
    analytics: {
        /** View course analytics. */
        view: boolean;
    };
    calls: {
        /** Start course calls. */
        start: boolean;
        /** Stop course calls. */
        stop: boolean;
    };
};
