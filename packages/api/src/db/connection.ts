import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely";
import type { DB } from "itam-edu-db";
import { Pool } from "pg";
import logger from "../logger";

/** Creates new database connection pool. */
export default function createDatabaseConnection(
    connectionString: string
): Kysely<DB> {
    return new Kysely<DB>({
        dialect: new PostgresDialect({
            pool: new Pool({
                application_name: "itam-edu-api",
                connectionString
            }),
            onCreateConnection: async () => {
                logger.trace("Database Connection Acquired");
            }
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
