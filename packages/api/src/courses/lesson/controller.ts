import { injectable } from "inversify";
import { Elysia, status, t } from "elysia";
import * as schema from "./schema";
import { REQUIRE_TOKEN } from "../../api/plugins/docs";
import { HttpError } from "../../api/errors";
import { AuthenticationPlugin } from "../../api/plugins/authenticate";
import { CourseRepository } from "../repository";
import { LessonService } from "./service";
import { LessonRepository } from "./repository";
import { LessonQuery } from "./query";
import { AttendanceQuery } from "./attendance/query";

@injectable()
export class LessonController {
    public constructor(
        protected authPlugin: AuthenticationPlugin,
        protected courseRepo: CourseRepository,
        protected lessonService: LessonService,
        protected lessonRepo: LessonRepository,
        protected lessonQuery: LessonQuery,
        protected attendanceQuery: AttendanceQuery
    ) {}

    public toElysia() {
        return new Elysia({
            name: "lessons",
            prefix: "/courses/:course/lessons",
            tags: ["Lessons"]
        })
            .use(this.authPlugin.toElysia())
            .guard({
                params: t.Object(
                    { course: t.String({ format: "uuid" }) },
                    { additionalProperties: true }
                )
            })
            .derive(async ({ params, status }) => {
                const course = await this.courseRepo.getById(params.course);
                if (!course) return status(404);
                return { course };
            })
            .get(
                "",
                async ({ params }) => {
                    const lessons = await this.lessonQuery.getAll(
                        params.course
                    );
                    return lessons;
                },
                {
                    detail: {
                        summary: "List lessons",
                        description: "Returns all lessons of the course."
                    }
                }
            )
            .post(
                "",
                async ({ user, course, body, status }) => {
                    const lesson = await this.lessonService.create(
                        user,
                        course,
                        body.lesson
                    );
                    if (lesson instanceof HttpError) {
                        return status(lesson.code, lesson.message);
                    }
                    return { id: lesson.id };
                },
                {
                    requireAuthentication: true,
                    body: t.Object({ lesson: schema.createLesson }),
                    detail: {
                        summary: "Create new lesson",
                        description: "Creates new lesson.",
                        security: REQUIRE_TOKEN
                    }
                }
            )
            .put(
                "",
                async ({ user, course, body }) => {
                    const result = await this.lessonService.updateAll(
                        user,
                        course,
                        body.lessons
                    );
                    if (result instanceof HttpError) {
                        return status(result.code, result.message);
                    }
                },
                {
                    requireAuthentication: true,
                    body: t.Object({ lessons: schema.updateLessonsList }),
                    detail: {
                        summary: "Update lessons",
                        description:
                            "Updates lessons list ordering. If lesson is not present, it is deleted.",
                        security: REQUIRE_TOKEN
                    }
                }
            )
            .get(
                "/:lesson",
                async ({ params, status }) => {
                    const lesson = await this.lessonQuery.get(
                        params.course,
                        params.lesson
                    );
                    if (lesson instanceof HttpError) {
                        return status(lesson.code, lesson.message);
                    }
                    return lesson;
                },
                {
                    params: t.Object(
                        { lesson: t.String() },
                        { additionalProperties: true }
                    ),
                    detail: {
                        summary: "Get lesson",
                        description: "Returns lesson with content."
                    }
                }
            )
            .patch(
                "/:lesson",
                async ({ params, body, user, status }) => {
                    const [course, lesson] = await Promise.all([
                        this.courseRepo.getById(params.course),
                        this.lessonRepo.load(params.course, params.lesson)
                    ]);
                    if (!course || !lesson) return status(404);

                    const newLesson = await this.lessonService.update(
                        user,
                        course,
                        lesson,
                        body
                    );
                    if (newLesson instanceof HttpError) {
                        return status(newLesson.code, newLesson.message);
                    }
                },
                {
                    requireAuthentication: true,
                    params: t.Object(
                        { lesson: t.String() },
                        { additionalProperties: true }
                    ),
                    body: schema.updateLesson,
                    detail: {
                        summary: "Update lesson",
                        description: "Updates lesson."
                    }
                }
            );
    }
}
