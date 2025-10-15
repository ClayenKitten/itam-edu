import { AppError } from "../../errors";

/** Course does not exist or user has no access to it. */
export class CourseNotFound extends AppError {
    public constructor(courseId: string) {
        super(
            "not-found-course",
            "Курс не существует или у вас нет к нему доступа",
            { httpCode: 404, resource: { kind: "course", id: courseId } }
        );
    }
}

/** Lesson does not exist. */
export class LessonNotFound extends AppError {
    public constructor(lessonId: string) {
        super(
            "not-found-lesson",
            "Урок не существует или у вас нет к нему доступа",
            { httpCode: 404, resource: { kind: "lesson", id: lessonId } }
        );
    }
}

/** Lesson must be scheduled. */
export class LessonNotScheduledConflict extends AppError {
    public constructor(lessonId: string) {
        super("lesson-not-scheduled", "Урок должен быть запланирован.", {
            httpCode: 409,
            resource: { kind: "lesson", id: lessonId }
        });
    }
}

/** User must be a course student to complete an action. */
export class UserIsNotCourseStudent extends AppError {
    public constructor() {
        super(
            "forbidden-not-course-student",
            "Вы не являетесь студентом курса",
            { httpCode: 403 }
        );
    }
}
