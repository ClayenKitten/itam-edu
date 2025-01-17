import { Elysia } from "elysia";

import cors from "./cors";
import docs from "./docs";
import logger from "./logger";
import db from "./db";
import authenticate from "./authenticate";
import authorize from "./authorize";

/** Creates an application context. */
export default async function initContext() {
    return new Elysia({ name: "context" })
        .use(cors())
        .use(await docs())
        .use(logger())
        .use(db())
        .use(authenticate())
        .use(authorize())
        .as("plugin");
}
