import Logger from "../logger";

import CourseRepository from "../api/courses/repository";
import UserRepository from "../api/users/repository";
import LessonRepository from "../api/courses/lesson/repository";
import StudentRepository from "../api/courses/student/repository";
import getDatabaseConnection from "./connection";
import NotificationRepository from "../api/notifications/repository";

export default class Database {
    constructor(connectionString: string, logger: Logger) {
        const connection = getDatabaseConnection(connectionString, logger);
        this.user = new UserRepository(connection, logger);
        this.course = new CourseRepository(connection, logger);
        this.lesson = new LessonRepository(connection, logger);
        this.student = new StudentRepository(connection, logger);
        this.notification = new NotificationRepository(connection, logger);
    }

    public readonly user: UserRepository;
    public readonly course: CourseRepository;
    public readonly lesson: LessonRepository;
    public readonly student: StudentRepository;
    public readonly notification: NotificationRepository;
}
