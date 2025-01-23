import api from "$lib/api";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch, params, depends }) => {
    depends("app:readme");
    const readme =
        "# Markdown test!\n\nHow _are_ **you**? Check out our [github](https://github.com/ClayenKitten/itam-edu)!";
    return { readme };
};
