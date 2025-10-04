import { ForbiddenError, NotFoundError } from "../../errors";

/** Course does not exist or user has no access to it. */
export class CourseNotFound extends NotFoundError {
    public code: string = "course-not-found";
    public message: string = "Курс не существует или у вас нет к нему доступа";

    public constructor(protected courseId: string) {
        super();
        this.meta = { resource: { kind: "course", id: this.courseId } };
    }
}

/** Lesson does not exist. */
export class LessonNotFound extends NotFoundError {
    public code: string = "lesson-not-found";
    public message: string = "Урок не существует или у вас нет к нему доступа";

    public constructor(protected lessonId: string) {
        super();
        this.meta = { resource: { kind: "lesson", id: this.lessonId } };
    }
}

/** User must be a course student to complete an action. */
export class UserIsNotCourseStudent extends ForbiddenError {
    public code: string = "not-course-student";
    public message: string = "Вы не являетесь студентом курса";

    public constructor() {
        super("not-course-student", "Вы не являетесь студентом курса");
    }
}
