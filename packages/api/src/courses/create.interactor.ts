import { injectable } from "inversify";
import type { Course } from "./entity";
import type { User } from "itam-edu-common";
import { Postgres } from "../infra/postgres";
import type { CreateCourseDto } from "./schema";
import { randomUUID } from "node:crypto";
import { CourseRepository } from "./repository";
import { ConflictError, ForbiddenError, HttpError } from "../api/errors";

@injectable()
export class CreateCourseInteractor {
    public constructor(
        protected postgres: Postgres,
        protected repository: CourseRepository
    ) {}

    /**
     * Creates new course.
     *
     * {@link actor} is automatically added as an owner of the course.
     * */
    public async invoke(
        actor: User,
        dto: CreateCourseDto
    ): Promise<Course | HttpError> {
        if (!actor.hasPermission("canCreateCourses")) {
            return new ForbiddenError("You are not allowed to create courses");
        }

        if (
            (await this.repository.getBySlug(
                dto.slug,
                dto.year,
                dto.semester
            )) !== null
        ) {
            return new ConflictError(
                "Course with such slug and period already exists"
            );
        }

        const id = randomUUID();
        await this.postgres.kysely
            .insertInto("courses")
            .values({
                id,
                slug: dto.slug,
                year: dto.year,
                semester: dto.semester,
                title: dto.title,
                isArchived: false,
                isEnrollmentOpen: true,
                isPublished: false
            })
            .execute();
        await this.postgres.kysely
            .insertInto("userCourses")
            .values({
                userId: actor.id,
                courseId: id,
                isOwner: true,
                isStaff: true,
                canEditContent: true,
                canEditInfo: true,
                canManageSubmissions: true
            })
            .execute();
        const course = await this.repository.getById(id);
        if (course === null) {
            throw Error("course must be non-null after creation");
        }
        return course;
    }
}
