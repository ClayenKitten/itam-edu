import { Elysia } from "elysia";

import cors from "./cors";
import docs from "./docs";
import httpLogger from "./logger";
import ctx from "./ctx";
import authenticate from "./authenticate";
import authorize from "./authorize";

/** Creates an application context. */
export default async function initContext() {
    return new Elysia({ name: "context" })
        .use(cors())
        .use(await docs())
        .use(ctx())
        .use(authenticate())
        .use(authorize())
        .use(httpLogger())
        .as("plugin");
}
