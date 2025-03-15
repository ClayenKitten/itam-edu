import type { DB } from "itam-edu-db";
import type { Kysely } from "kysely";

/** Abstract class for database operations. */
export abstract class Repository {
    public constructor(protected db: Kysely<DB>) {}

    protected get repositoryName() {
        return this.constructor.name;
    }
}
