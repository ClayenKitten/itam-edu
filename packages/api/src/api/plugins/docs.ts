import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";

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
                    tags: [
                        { name: "Users" },
                        { name: "Courses" },
                        { name: "Lessons" },
                        { name: "Homeworks" },
                        { name: "Students" },
                        { name: "Media" },
                        { name: "Infra" }
                    ]
                }
            })
        )
        .as("plugin");
}

export const DEFAULT_SECURITY = [{ main: [] }];
