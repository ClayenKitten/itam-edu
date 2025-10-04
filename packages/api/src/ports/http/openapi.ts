import { Elysia } from "elysia";
import { openapi } from "@elysiajs/openapi";

export function openapiPlugin() {
    return new Elysia({ name: "docs" })
        .use(
            openapi({
                provider: "swagger-ui",
                path: "docs",
                swagger: {
                    persistAuthorization: true
                },
                documentation: {
                    info: {
                        title: "ITAM Education API",
                        description: "REST API for ITAM Education platform.",
                        version: process.env.npm_package_version!
                    },
                    servers: [{ url: "/api" }],
                    components: {
                        securitySchemes: {
                            main: {
                                type: "apiKey",
                                name: "Authorization",
                                in: "header"
                            }
                        }
                    },
                    security: [
                        {}, // "None" - allow user to call endpoint without authentication
                        { main: [] }
                    ],
                    tags: [
                        { name: "Users" },
                        { name: "Courses" },
                        { name: "Lessons" },
                        { name: "Attendance" },
                        { name: "Homeworks" },
                        { name: "Submissions" },
                        { name: "Students" },
                        { name: "Staff" },
                        { name: "Invites" },
                        { name: "Calls" },
                        { name: "Files" },
                        { name: "Infra" }
                    ]
                }
            })
        )
        .as("scoped");
}

export const NO_AUTHENTICATION = [{}];
export const REQUIRE_TOKEN = [{ main: [] }];
