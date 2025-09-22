/** Builder for user file paths. */
export const userFilePath = (user: string) => ({
    avatar: (avatar: string) => {
        return `/files/users/${user}/avatar/${avatar}`;
    }
});

/** Builder for course file paths. */
export const courseFilePath = (course: string, path: string) => {
    return `/files/courses/${course}/${path}`;
};
