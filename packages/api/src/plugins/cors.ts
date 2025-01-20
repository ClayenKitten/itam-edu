import { Elysia } from "elysia";
import { cors as corsPlugin } from "@elysiajs/cors";
import { env } from "process";

export default function cors() {
    return new Elysia({ name: "cors" }).use(
        corsPlugin({
            origin:
                env.NODE_ENV === "production"
                    ? env.ITAM_EDU_API_WEB_HOST!
                    : () => true
        }).as("plugin")
    );
}
