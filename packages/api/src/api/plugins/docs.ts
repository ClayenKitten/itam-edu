import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";

export default async function docs() {
    return new Elysia({ name: "docs" })
        .use(
            await swagger({
                provider: "swagger-ui",
                path: "/docs",
                documentation: {
                    tags: [
                        { name: "Courses" },
                        { name: "Lessons" },
                        { name: "Students" },
                        { name: "Users" },
                        { name: "Telegram Bot" },
                        { name: "Infra" }
                    ]
                }
            })
        )
        .as("plugin");
}
