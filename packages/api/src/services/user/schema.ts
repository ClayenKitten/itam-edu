import { z, type TypeOf } from "zod";

export const userSchema = z.object({
    id: z.string().uuid(),
    firstName: z.string().max(100).nullable(),
    lastName: z.string().max(100).nullable(),
    patronim: z.string().max(100).nullable(),
    email: z.string().email().max(500).nullable(),
    avatar: z.string().url().max(1000).nullable(),
    bio: z.string().max(500).nullable(),
    tgUsername: z.string()
});
export type UserSchema = TypeOf<typeof userSchema>;

export const userSchemaFields = userSchema.keyof().options;
