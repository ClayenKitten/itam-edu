// See https://svelte.dev/docs/kit/types#app.d.ts

import type { PublicAppConfig } from "$lib/config";
import type { User } from "itam-edu-common";
import type { AppConfig } from "itam-edu-common/config";

// for information about these interfaces
declare global {
    namespace App {
        // interface Error {}
        interface Locals {
            config: AppConfig;
            user: User | null;
        }
        interface PageData {
            config: PublicAppConfig;
            user: User | null;
        }
        // interface PageState {}
        // interface Platform {}
    }
}

export {};
