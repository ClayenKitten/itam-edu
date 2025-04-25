/** Builder for user file paths. */
export const userFilePath = (user: string) => ({
    avatar: (avatar: string) => {
        return `/files/users/${user}/avatar/${avatar}`;
    }
});
