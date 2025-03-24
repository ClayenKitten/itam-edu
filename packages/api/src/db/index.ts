import getDatabaseConnection from "./connection";

import UserRepository from "../users/repository";
import CourseRepository from "../courses/repository";
import LessonRepository from "../courses/lesson/repository";
import StudentRepository from "../courses/student/repository";
import NotificationRepository from "../notifications/repository";
import HomeworkRepository from "../courses/homework/repository";
import SubmissionRepository from "../courses/submission/repository";

export default class Database {
    constructor(connectionString: string) {
        const connection = getDatabaseConnection(connectionString);
        this.user = new UserRepository(connection);
        this.course = new CourseRepository(connection);
        this.lesson = new LessonRepository(connection);
        this.student = new StudentRepository(connection);
        this.notification = new NotificationRepository(connection);
        this.homework = new HomeworkRepository(connection);
        this.submission = new SubmissionRepository(connection);
    }

    public readonly user: UserRepository;
    public readonly course: CourseRepository;
    public readonly lesson: LessonRepository;
    public readonly student: StudentRepository;
    public readonly notification: NotificationRepository;
    public readonly homework: HomeworkRepository;
    public readonly submission: SubmissionRepository;
}
