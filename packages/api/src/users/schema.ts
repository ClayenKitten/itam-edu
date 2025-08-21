import { t } from "elysia";

export const updateUser = t.Partial(
    t.Object({
        avatar: t.Nullable(t.String()),
        bio: t.Nullable(t.String()),
        firstName: t.String(),
        lastName: t.Nullable(t.String())
    })
);
export type UpdateUserDto = typeof updateUser.static;
