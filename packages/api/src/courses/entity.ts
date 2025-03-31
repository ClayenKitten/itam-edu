import * as schema from "./schema";

export class Course {
    public constructor(private info: typeof schema.course.static) {}

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

    public toDTO(): typeof schema.course.static {
        return this.info;
    }
}
