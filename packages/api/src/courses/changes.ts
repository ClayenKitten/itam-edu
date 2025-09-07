import type { User } from "itam-edu-common";
import type { Course } from "./entity";
import { injectable } from "inversify";
import { Postgres } from "../infra/postgres";
import logger from "../logger";

/**
 * Change that occured in the course.
 *
 * Note: this is not an event-sourcing event log. It is only used for
 * audit purposes, i.e. just to be displayed to the user.
 */
export type CourseChange = {
    id: string;
    actorId: string;
    courseId: string;
    createdAt: Date;
    payload: CourseChangePayload;
};

export type CourseChangePayload =
    | { kind: "course-created" }
    | { kind: "user-joined"; userId: string; role: "student" | "staff" }
    | { kind: "user-left"; userId: string; role: "student" | "staff" }
    | { kind: "lesson-created"; lessonId: string }
    | { kind: "lesson-schedule-changed"; lessonId: string }
    | { kind: "homework-created"; homeworkId: string }
    | { kind: "homework-deadline-changed"; homeworkId: string }
    | { kind: "submission-created"; homeworkId: string; studentId: string }
    | {
          kind: "submission-reviewed";
          homeworkId: string;
          studentId: string;
          accepted: boolean;
      };

/** Course changelog for audit purposes. */
@injectable()
export class CourseChangelog {
    public constructor(private postgres: Postgres) {}

    /**
     * Returns course changes.
     *
     * Only changes observable by the user are returned.
     * */
    public async get(
        course: Course,
        user: User | null
    ): Promise<CourseChange[]> {
        let events: CourseChange[] = await this.postgres.kysely
            .selectFrom("courseChanges")
            .select(["id", "actorId", "courseId", "createdAt", "payload"])
            .where("courseId", "=", course.id)
            .$narrowType<{ payload: CourseChangePayload }>()
            .orderBy("createdAt desc")
            .execute();
        return events.filter(change => this.canUserView(change, user));
    }

    private canUserView(change: CourseChange, user: User | null): boolean {
        switch (change.payload.kind) {
            case "user-joined":
            case "user-left":
                if (user === null) return false;
                if (user.id === change.payload.userId) return true;
                if (
                    user.isCourseStaff(change.courseId) &&
                    change.payload.role === "staff"
                ) {
                    return true;
                }
                return false;
            case "course-created":
            case "lesson-created":
            case "lesson-schedule-changed":
            case "homework-created":
            case "homework-deadline-changed":
                return true;
            case "submission-created":
            case "submission-reviewed":
                if (user === null) return false;
                if (user.id === change.payload.studentId) return true;
                if (user.isCourseStaff(change.courseId)) return true;
                return false;
            default:
                let guard: never = change.payload;
                return false;
        }
    }

    /** Adds new entry to the course changelog. */
    public async add(
        actor: User,
        course: Course,
        payload: CourseChangePayload
    ) {
        await this.postgres.kysely
            .insertInto("courseChanges")
            .values({
                actorId: actor.id,
                courseId: course.id,
                payload
            })
            .execute();
        logger.trace("Course changelog entry added", {
            actorId: actor.id,
            courseId: course.id,
            payload
        });
    }
}
