import { injectable } from "inversify";
import type { User } from "itam-edu-common";
import {
    ConflictError,
    ForbiddenError,
    HttpError,
    NotFoundError
} from "../../../api/errors";
import type { Course } from "../entity";
import type Homework from "../homework/entity";
import { NotificationSender } from "../../notifications/sender";
import { CourseChangelog } from "../changes";
import { SubmissionRepository } from "./repository";
import { randomUUID } from "crypto";
import { Submission } from "./entity";
import { CourseRepository } from "../repository";
import { HomeworkRepository } from "../homework/repository";
import { NotificationTemplate } from "../../notifications";
import { UploadService } from "../../files/upload/service";
import { FileSpec, MEGABYTE } from "../../files/specs";
import { match, uuid, type UUID } from "../../files/specs/dsl";
import { splitFilename } from "../../files/utils";

@injectable()
export class SubmitHomework {
    public constructor(
        private courseRepo: CourseRepository,
        private homeworkRepo: HomeworkRepository,
        private repository: SubmissionRepository,
        private notificationSender: NotificationSender,
        private courseChangelog: CourseChangelog,
        private uploadService: UploadService
    ) {}

    /** Creates new homework submission. */
    public async invoke(
        actor: User,
        courseId: string,
        homeworkId: string,
        content: string,
        attachments: File[] = []
    ): Promise<void | HttpError> {
        const course = await this.courseRepo.getById(courseId);
        const permissions = course?.getPermissionsFor(actor);
        if (!course || !permissions) {
            return new NotFoundError("Course not found.");
        }
        if (permissions.submissions.create !== true) {
            return new ForbiddenError(
                "You are not allowed to create homework submissions."
            );
        }

        const homework = await this.homeworkRepo.load(course.id, homeworkId);
        if (!homework) {
            return new NotFoundError("Homework not found.");
        }
        if (homework.isSubmissionOpen !== true) {
            return new ConflictError("Homework does not accept submissions.");
        }

        let submission = await this.repository.load(homework.id, actor.id);
        if (submission !== null && submission.lastAttempt.review === null) {
            return new ConflictError("Submission is not reviewed yet.");
        }

        const key = crypto.randomUUID();
        const files = await Promise.all(
            attachments.map(async attachment => {
                const { name, extension } = splitFilename(attachment.name);
                const spec = new SubmissionAttachment(
                    actor.id as UUID,
                    key,
                    name,
                    extension
                );
                const { path } = await this.uploadService.uploadBlob(
                    spec,
                    attachment
                );
                return path;
            })
        );

        const attempt = {
            id: randomUUID(),
            content,
            files,
            review: null,
            sentAt: new Date()
        };
        if (!submission) {
            submission = new Submission(homework.id, actor.id, [attempt]);
        } else {
            submission.attempts.push(attempt);
        }
        await this.repository.save(submission);

        await Promise.allSettled([
            this.courseChangelog.add(actor, course, {
                kind: "submission-created",
                homeworkId: homework.id,
                studentId: actor.id
            }),
            this.notificationSender.send(
                new Notification(course, homework, actor),
                course.members.filter(m => m.role !== "student").map(m => m.id)
            )
        ]);
    }
}

class Notification extends NotificationTemplate {
    public constructor(
        private course: Course,
        private homework: Homework,
        private student: User
    ) {
        super();
    }

    public override toWeb(id: string, _userId: string) {
        return {
            id,
            timestamp: Date.now(),
            courseId: this.course.id,
            title: `Студент @${this.student.telegram.username} отправил задание '${this.homework.title}'.`,
            icon: "scroll",
            url: `${this.course.path}/homeworks/${this.homework.id}?student=${this.student.id}`
        };
    }

    public override toTelegram(id: string, _userId: string) {
        return {
            id,
            text: [
                "<b>📝 Новый ответ на задание</b>",
                `Студент @${this.student.telegram.username} сдал(а) задание '${this.homework.title}'.`
            ].join("\n\n"),
            link: {
                text: "🔗 Проверить",
                url: `${this.course.path}/homeworks/${this.homework.id}/review/${this.student.id}`
            }
        };
    }
}

/** Attachment that student may add to the submission. */
export class SubmissionAttachment extends FileSpec {
    public constructor(
        public readonly userId: UUID,
        /** Random key to prevent collisions. */
        public readonly key: UUID,
        public readonly name: string,
        public readonly extension: string | null
    ) {
        super(SubmissionAttachment.MAX_SIZE);
    }

    public static readonly MAX_SIZE = 50 * MEGABYTE;

    public static parse(
        path: ReadonlyArray<string>
    ): SubmissionAttachment | null {
        const matched = match(path, {
            pattern: ["users", uuid, "attachments", uuid]
        });
        if (!matched) return null;
        return new SubmissionAttachment(
            matched.ids[0]!,
            matched.ids[1]!,
            matched.name,
            matched.extension
        );
    }

    public get path(): string[] {
        return [
            "users",
            this.userId,
            "attachments",
            this.key,
            this.extension ? `${this.name}.${this.extension}` : this.name
        ];
    }
}
