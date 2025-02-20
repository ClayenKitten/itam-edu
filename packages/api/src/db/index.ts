import Logger from "../logger";
import getDatabaseConnection from "./connection";

import UserRepository from "../api/users/repository";
import CourseRepository from "../api/courses/repository";
import LessonRepository from "../api/courses/lesson/repository";
import StudentRepository from "../api/courses/student/repository";
import NotificationRepository from "../notifications/repository";
import HomeworkRepository from "../api/courses/homework/repository";

export default class Database {
    constructor(connectionString: string, logger: Logger) {
        const connection = getDatabaseConnection(connectionString, logger);
        this.user = new UserRepository(connection, logger);
        this.course = new CourseRepository(connection, logger);
        this.lesson = new LessonRepository(connection, logger);
        this.student = new StudentRepository(connection, logger);
        this.notification = new NotificationRepository(connection, logger);
        this.homework = new HomeworkRepository(connection, logger);
    }

    public readonly user: UserRepository;
    public readonly course: CourseRepository;
    public readonly lesson: LessonRepository;
    public readonly student: StudentRepository;
    public readonly notification: NotificationRepository;
    public readonly homework: HomeworkRepository;
}
