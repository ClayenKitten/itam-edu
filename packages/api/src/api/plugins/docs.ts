import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { main } from "bun";

export default async function docs() {
    return new Elysia({ name: "docs" })
        .use(
            await swagger({
                provider: "swagger-ui",
                path: "/docs",
                swaggerOptions: {
                    persistAuthorization: true
                },
                documentation: {
                    info: {
                        title: "ITAM Education API",
                        description: "REST API for ITAM Education platform.",
                        version: process.env.npm_package_version!
                    },
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
                        { name: "Homeworks" },
                        { name: "Submissions" },
                        { name: "Students" },
                        { name: "Staff" },
                        { name: "Media" },
                        { name: "Infra" }
                    ]
                }
            })
        )
        .as("plugin");
}

export const NO_AUTHENTICATION = [{}];
export const REQUIRE_TOKEN = [{ main: [] }];
