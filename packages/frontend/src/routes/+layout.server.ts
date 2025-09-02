import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ depends, cookies }) => {
    depends("app:user");
    return {
        sessionToken: cookies.get("itam-edu-token")
    };
};
