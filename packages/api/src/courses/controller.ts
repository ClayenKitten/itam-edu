import { injectable } from "inversify";
import { Elysia, t } from "elysia";
import * as schema from "./schema";
import { REQUIRE_TOKEN } from "../api/plugins/docs";
import { AuthenticationPlugin } from "../api/plugins/authenticate";
import { CourseRepository } from "./repository";
import { CourseQuery } from "./query";
import { CourseChangelog } from "./changes";
import { CreateCourse } from "./create.interactor";
import { UpdateCourse } from "./update.interactor";
import { HttpError } from "../api/errors";
import { CourseStatisticsQuery } from "./analytics/query";

@injectable()
export class CourseController {
    public constructor(
        private authPlugin: AuthenticationPlugin,
        private courseRepo: CourseRepository,
        private courseQuery: CourseQuery,
        private courseChangelog: CourseChangelog,
        private createCourseInteractor: CreateCourse,
        private updateCourseInteractor: UpdateCourse,
        private statisticsQuery: CourseStatisticsQuery
    ) {}

    public toElysia() {
        return new Elysia({ prefix: "/courses", tags: ["Courses"] })
            .use(this.authPlugin.toElysia())
            .get(
                "",
                async ({ user }) => {
                    const courses = await this.courseQuery.getAll(user);
                    return courses;
                },
                {
                    detail: {
                        summary: "List courses",
                        description: "Returns all courses"
                    }
                }
            )
            .post(
                "",
                async ({ user, body, status }) => {
                    const result = await this.createCourseInteractor.invoke(
                        user,
                        body
                    );
                    if (result instanceof HttpError) {
                        return status(result.code, result.message);
                    }
                    return result.toDTO();
                },
                {
                    requireAuthentication: true,
                    body: schema.createCourse,
                    detail: {
                        summary: "Create new course",
                        description: "Creates new course.",
                        security: REQUIRE_TOKEN
                    }
                }
            )
            .get(
                "/lookup/:slug",
                async ({ params, query, status }) => {
                    const course = await this.courseRepo.getBySlug(
                        params.slug,
                        query.year,
                        query.semester
                    );
                    if (!course) return status(404);
                    return course.toDTO();
                },
                {
                    query: t.Partial(
                        t.Object({
                            year: schema.course.properties.year,
                            semester: t.Exclude(
                                schema.course.properties.semester,
                                t.Null()
                            )
                        })
                    ),
                    params: t.Object({
                        slug: schema.course.properties.slug
                    }),
                    detail: {
                        summary: "Lookup course id",
                        description:
                            "Returns course id by human-readable identifier."
                    }
                }
            )
            .get(
                "/:course",
                async ({ user, params, status }) => {
                    const result = await this.courseQuery.get(
                        user,
                        params.course
                    );
                    if (result instanceof HttpError) {
                        return status(result.code, result.message);
                    }
                    return result;
                },
                {
                    detail: {
                        summary: "Get course",
                        description: "Returns course."
                    }
                }
            )
            .patch(
                "/:course",
                async ({ user, params, body, status }) => {
                    const course = await this.courseRepo.getById(params.course);
                    if (!course) return status(404);

                    const result = await this.updateCourseInteractor.invoke(
                        user,
                        course,
                        body
                    );
                    if (result instanceof HttpError) {
                        return status(result.code, result.message);
                    }
                    return status(200, "Course updated successfully");
                },
                {
                    requireAuthentication: true,
                    body: schema.updateCourse,
                    detail: {
                        summary: "Update course",
                        description: "Updates course.",
                        security: REQUIRE_TOKEN
                    }
                }
            )
            .get(
                "/:course/changes",
                async ({ user, params, status }) => {
                    const course = await this.courseRepo.getById(params.course);
                    if (!course) return status(404);
                    return await this.courseChangelog.get(course, user);
                },
                {
                    detail: {
                        summary: "Get course changes",
                        description: "Returns course changelog."
                    }
                }
            )
            .get(
                "/:course/statistics",
                async ({ user, params, status }) => {
                    const result = await this.statisticsQuery.get(
                        user,
                        params.course
                    );
                    if (result instanceof HttpError) {
                        return status(result.code, result.message);
                    }
                    return result;
                },
                {
                    requireAuthentication: true,
                    detail: {
                        summary: "Get course statistics",
                        description: "Returns course statistics."
                    }
                }
            );
    }
}
