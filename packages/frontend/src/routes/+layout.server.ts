import type { LayoutServerLoad } from "./$types";
import { getPublicAppConfig, type PublicAppConfig } from "$lib/config";
import type { User } from "itam-edu-common";

export const load: LayoutServerLoad = async ({ depends, locals }) => {
    depends("app:user");

    const config: PublicAppConfig = getPublicAppConfig(locals.config);
    const user: User | null = locals.user;

    return {
        config,
        user
    };
};
