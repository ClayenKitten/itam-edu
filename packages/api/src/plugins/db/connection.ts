import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely";
import type { DB } from "itam-edu-db";
import { Pool } from "pg";
import type { Logger } from "../logger";

export default function getDatabaseConnection(
    connectionString: string,
    logger: Logger
) {
    if (!cache) {
        cache = new Pool({
            application_name: "itam-edu-api",
            connectionString
        });
    }
    return new Kysely<DB>({
        dialect: new PostgresDialect({
            pool: cache,
            onCreateConnection: async () => {
                logger.debug("Database Connection Acquired");
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
let cache: Pool | null = null;
