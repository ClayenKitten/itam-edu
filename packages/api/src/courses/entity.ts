import * as schema from "./schema";

export class Course {
    public constructor(
        private info: typeof schema.course.static,
        public readonly staffIds: ReadonlyArray<string>,
        public readonly studentIds: ReadonlyArray<string>
    ) {}

    public get id(): string {
        return this.info.id;
    }

    public get canEnrollStudents(): boolean {
        return (
            this.info.isEnrollmentOpen &&
            this.info.isPublished &&
            !this.info.isArchived
        );
    }

    public get path(): string {
        if (this.info.semester) {
            return `/c/${this.info.year}/${this.info.semester}/${this.info.slug}`;
        }
        return `/c/${this.info.year}/${this.info.slug}`;
    }

    public toDTO(): typeof schema.course.static {
        return this.info;
    }
}
