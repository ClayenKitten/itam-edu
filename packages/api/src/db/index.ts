import getDatabaseConnection from "./connection";

import UserRepository from "../users/repository";
import CourseRepository from "../api/courses/repository";
import LessonRepository from "../api/courses/lesson/repository";
import StudentRepository from "../api/courses/student/repository";
import NotificationRepository from "../notifications/repository";
import HomeworkRepository from "../api/courses/homework/repository";

export default class Database {
    constructor(connectionString: string) {
        const connection = getDatabaseConnection(connectionString);
        this.user = new UserRepository(connection);
        this.course = new CourseRepository(connection);
        this.lesson = new LessonRepository(connection);
        this.student = new StudentRepository(connection);
        this.notification = new NotificationRepository(connection);
        this.homework = new HomeworkRepository(connection);
    }

    public readonly user: UserRepository;
    public readonly course: CourseRepository;
    public readonly lesson: LessonRepository;
    public readonly student: StudentRepository;
    public readonly notification: NotificationRepository;
    public readonly homework: HomeworkRepository;
}
