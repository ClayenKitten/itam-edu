import { injectable } from "inversify";
import { UnauthorizedError } from "../../api/errors";
import { NotificationSender } from "../../notifications";
import type { User } from "itam-edu-common";
import type { Course } from "../entity";
import { Lesson } from "./entity";
import { LessonRepository } from "./repository";
import * as schema from "./schema";
import { randomUUID } from "crypto";
import { CourseChangelog } from "../changes";
import { LessonRescheduleNotification } from "./notifications";

@injectable()
export class LessonService {
    public constructor(
        protected lessonRepo: LessonRepository,
        protected notificationSender: NotificationSender,
        protected changelog: CourseChangelog
    ) {}

    /** Creates new lesson. */
    public async create(
        actor: User,
        course: Course,
        data: typeof schema.createLesson.static
    ): Promise<Lesson | UnauthorizedError> {
        if (!actor.hasCoursePermission(course.id, "canEditContent")) {
            return new UnauthorizedError();
        }

        const newLesson = new Lesson(
            randomUUID(),
            course.id,
            data.info,
            data.content,
            data.homeworks,
            data.schedule
        );
        await this.lessonRepo.set(newLesson);
        await this.changelog.add(actor, course, {
            kind: "lesson-created",
            lessonId: newLesson.id
        });
        return newLesson;
    }

    /** Updates existing lesson. */
    public async update(
        actor: User,
        course: Course,
        lesson: Lesson,
        change: typeof schema.updateLesson.static
    ): Promise<Lesson | UnauthorizedError> {
        if (!actor.hasCoursePermission(course.id, "canEditContent")) {
            return new UnauthorizedError();
        }

        const newLesson = new Lesson(
            lesson.id,
            lesson.courseId,
            {
                ...lesson.info,
                ...change.info
            },
            change.content ?? lesson.content,
            change.homeworks ?? lesson.homeworks,
            change.schedule ?? lesson.schedule
        );
        await this.lessonRepo.set(newLesson);

        if (change.schedule !== undefined) {
            if (newLesson.schedule !== null) {
                await this.notificationSender.send(
                    new LessonRescheduleNotification(course, newLesson)
                );
                await this.changelog.add(actor, course, {
                    kind: "lesson-schedule-changed",
                    lessonId: lesson.id
                });
            }
        }

        return newLesson;
    }

    /** Updates lesson list. */
    public async updateAll(
        actor: User,
        course: Course,
        update: typeof schema.updateLessonsList.static
    ): Promise<void | UnauthorizedError> {
        if (!actor.hasCoursePermission(course.id, "canEditContent")) {
            return new UnauthorizedError();
        }
        await this.lessonRepo.updateAll(course, update);
    }
}
