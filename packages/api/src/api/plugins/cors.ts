import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";

export function corsPlugin() {
    return new Elysia({ name: "cors" }).use(
        cors({ origin: true }).as("scoped")
    );
}
