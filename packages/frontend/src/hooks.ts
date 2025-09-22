import type { Transport } from "@sveltejs/kit";
import { User } from "itam-edu-common";

export const transport: Transport = {
    user: {
        encode: user =>
            user instanceof User && {
                id: user.id,
                info: user.info,
                telegram: user.telegram,
                courses: user.courses
            },

        decode: user =>
            new User(user.id, user.info, user.telegram, user.courses)
    }
};
