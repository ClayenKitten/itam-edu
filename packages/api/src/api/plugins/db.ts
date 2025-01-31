import Elysia from "elysia";
import logger from "./logger";
import Database from "../../db";
import { env } from "process";

export default function db() {
    return new Elysia({ name: "db" })
        .use(logger())
        .derive(({ logger }) => {
            const connectionString = env.ITAM_EDU_API_DB_CONNECTION_STRING!;
            return {
                db: new Database(connectionString, logger)
            };
        })
        .as("plugin");
}
