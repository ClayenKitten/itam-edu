import type { DB } from "itam-edu-db";
import type { Kysely } from "kysely";
import type Logger from "../logger";

/** Abstract class for database operations. */
export abstract class Repository {
    public constructor(
        protected db: Kysely<DB>,
        protected logger: Logger
    ) {
        this.logger = this.logger.child({ repository: this.repositoryName });
    }

    protected get repositoryName() {
        return this.constructor.name;
    }
}
