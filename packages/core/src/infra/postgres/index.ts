import { inject, injectable } from "inversify";
import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import { Logger } from "../../logger";
import type { AppConfig } from "../../config";
import type { DB } from "./schema";

export * from "./schema";

/** PostgreSQL database. */
@injectable()
export class Postgres {
    public constructor(
        @inject("AppConfig")
        config: AppConfig,
        logger: Logger
    ) {
        this.connectionString = config.postgres.connectionString;
        this.pool = new Pool({
            application_name: "itam-edu-api",
            connectionString: this.connectionString,
            max: 16,
            min: 1
        });
        this.kysely = new Kysely<DB>({
            dialect: new PostgresDialect({
                pool: this.pool,
                onCreateConnection: async () => {
                    logger.trace("Postgres connection acquired");
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

    protected connectionString: string;

    /** Postgres connection pool. */
    public readonly pool: Pool;

    /** Kysely wrapper around connection pool. */
    public readonly kysely: Kysely<DB>;
}
