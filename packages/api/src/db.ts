import type { DB } from "itam-edu-db";
import pg from "pg";
import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely";
import { env } from "process";
import logger from "./logger.js";

export default function createDatabaseConnection() {
    return new Kysely<DB>({
        dialect: new PostgresDialect({
            pool: new pg.Pool({
                connectionString: env.ITAM_EDU_API_DB_CONNECTION_STRING,
                log: (message, ...e) => {
                    if (message === "client failed to connect") {
                        logger.error("Database Connection Failed");
                    }
                }
            })
        }),
        plugins: [new CamelCasePlugin()],
        log: e => {
            if (e.level === "error") {
                logger.error("Database Query Failed", {
                    error: `${e.error}`,
                    query: e.query.sql,
                    stacktrace: Error.captureStackTrace({})
                });
            }
        }
    });
}
