import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { env } from "process";

export function corsPlugin() {
    return new Elysia({ name: "cors" }).use(
        cors({
            origin:
                env.NODE_ENV === "production"
                    ? env.ITAM_EDU_FRONTEND_URL!
                    : () => true
        }).as("scoped")
    );
}
