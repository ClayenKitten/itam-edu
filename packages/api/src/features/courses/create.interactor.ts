import { injectable } from "inversify";
import type { Course } from "./entity";
import type { User } from "itam-edu-common";
import { Postgres } from "../../infra/postgres";
import type { CreateCourseDto } from "./schema";
import { randomUUID } from "node:crypto";
import { CourseRepository } from "./repository";
import { ConflictError, ForbiddenError, HttpError } from "../../api/errors";
import { CourseChangelog } from "./changes";
import { NotificationTemplate } from "../notifications";
import { NotificationSender } from "../notifications/sender";

@injectable()
export class CreateCourse {
    public constructor(
        private postgres: Postgres,
        private repository: CourseRepository,
        private notificationSender: NotificationSender,
        private changelog: CourseChangelog
    ) {}

    /** Creates new course. */
    public async invoke(
        actor: User,
        dto: CreateCourseDto
    ): Promise<Course | HttpError> {
        if (actor.permissions.courses.create !== true) {
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
        await this.postgres.kysely.transaction().execute(async trx => {
            await trx
                .insertInto("courses")
                .values({
                    id,
                    slug: dto.slug,
                    year: dto.year,
                    semester: dto.semester,
                    title: dto.title,
                    ownerId: dto.ownerId,
                    isArchived: false,
                    isEnrollmentOpen: false,
                    isPublished: false
                })
                .execute();
            await trx
                .insertInto("userCourses")
                .values({
                    userId: dto.ownerId,
                    courseId: id,
                    role: "admin"
                })
                .execute();
        });
        const course = await this.repository.getById(id);
        if (course === null) {
            throw Error("course must be non-null after creation");
        }

        await Promise.all([
            this.notificationSender.send(new Notification(course), [
                dto.ownerId
            ]),
            this.changelog.add(actor, course, { kind: "course-created" })
        ]);
        return course;
    }
}

class Notification extends NotificationTemplate {
    public constructor(private course: Course) {
        super();
    }

    public toWeb(id: string, _userId: string) {
        return {
            id,
            timestamp: Date.now(),
            courseId: this.course.id,
            title: `Вы назначены владельцем курса '${this.course.info.title}'`,
            icon: "magic-wand",
            url: this.course.path
        };
    }

    public toTelegram(id: string, _userId: string) {
        return {
            id,
            text: [
                `<b>🪄 Вы назначены владельцем курса '${this.course.info.title}'</b>\n`,
                "Пора приступать к заполнению! Когда будете готовы к публикации — обратитесь к администрации платформы."
            ].join("\n"),
            link: {
                text: "🔗 Страница курса",
                url: this.course.path
            }
        };
    }
}
