import { injectable } from "inversify";
import { Elysia, t } from "elysia";
import * as schema from "./schema";
import { REQUIRE_TOKEN } from "../api/plugins/docs";
import { authenticationPlugin } from "../api/plugins/authenticate";
import { UserRepository } from "../users/repository";
import { CourseRepository } from "./repository";
import { CourseQuery } from "./query";

@injectable()
export class CourseController {
    public constructor(
        protected userRepo: UserRepository,
        protected courseRepo: CourseRepository,
        protected courseQuery: CourseQuery
    ) {}

    public toElysia() {
        return new Elysia({ prefix: "/courses", tags: ["Courses"] })
            .use(authenticationPlugin(this.userRepo))
            .get(
                "",
                async () => {
                    const courses = await this.courseRepo.getAll();
                    return courses.map(c => c.toDTO());
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
                async ({ body, status }) => {
                    const course = await this.courseRepo.create(body);
                    if (!course) return status(400, "Couldn't create course");
                    return course.toDTO();
                },
                {
                    hasPermission: ["canCreateCourses"],
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
                            year: t.Integer(),
                            semester: t.Integer()
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
                async ({ params, status }) => {
                    const course = await this.courseQuery.get(params.course);
                    if (!course) return status(404);
                    return course;
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
                async ({ params, body, status }) => {
                    const course = await this.courseRepo.update(
                        params.course,
                        body
                    );
                    if (!course) return status(404);
                    return course.toDTO();
                },
                {
                    body: schema.updateCourse,
                    hasCoursePermission: "canEditInfo",
                    detail: {
                        summary: "Update course",
                        description: "Updates course.",
                        security: REQUIRE_TOKEN
                    }
                }
            );
    }
}
