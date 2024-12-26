import type { DB } from "itam-edu-db";
import pg from "pg";
import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely";
import { env } from "process";

export default function createDatabaseConnection() {
    return new Kysely<DB>({
        dialect: new PostgresDialect({
            pool: new pg.Pool({
                connectionString: env.ITAM_EDU_API_DB_CONNECTION_STRING
            })
        }),
        plugins: [new CamelCasePlugin()]
    });
}
