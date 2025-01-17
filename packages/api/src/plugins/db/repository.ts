import type { DB } from "itam-edu-db";
import type { Kysely } from "kysely";
import type { Logger } from "../logger";
import getDatabaseConnection from "./connection";

/** Abstract class for database operations. */
export abstract class Repository {
    public constructor(
        protected connectionString: string,
        protected logger: Logger
    ) {
        this.logger = this.logger.child({ repository: this.repositoryName });
        this.db = getDatabaseConnection(this.connectionString, this.logger);
    }

    protected db: Kysely<DB>;

    protected get repositoryName() {
        return this.constructor.name;
    }
}
