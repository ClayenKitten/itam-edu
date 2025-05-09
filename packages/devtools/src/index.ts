import Handlebars from "handlebars";
import * as db from "./db";
import { fakerRU as faker } from "@faker-js/faker";
import { randomUUID } from "crypto";

async function render(userId?: string) {
    const users = await db.getUsers();
    const user = users.find(u => u.id === userId);
    let messages: db.Message[] = [];

    if (userId && !user) {
        return new Response("Not Found", { status: 404 });
    } else if (user) {
        messages = await db.getMessages(user.tgUserId);
    }

    const renderer = Handlebars.compile(
        await Bun.file("./src/static/index.html.hbs").text()
    );
    const html = renderer({ user, users, messages });
    return new Response(html, {
        headers: {
            "content-type": "text/html"
        }
    });
}

const server = Bun.serve({
    hostname: "0.0.0.0",
    port: 3000,
    routes: {
        "/": async () => {
            return await render();
        },
        "/:userId": async req => {
            const userId = req.params.userId;
            return await render(userId);
        },
        "/style.css": async () => {
            return new Response(Bun.file("./src/static/style.css"));
        },
        "/users": {
            POST: async req => {
                const userId = randomUUID();
                const sex = faker.person.sexType();
                const firstName = faker.person.firstName(sex);
                const lastName = faker.person.lastName(sex);
                const tgUsername = faker.internet.username({
                    firstName,
                    lastName
                });
                const user: db.User = {
                    id: userId,
                    firstName,
                    lastName,
                    tgUsername,
                    tgUserId: faker.number.bigInt().toString()
                };
                await db.addUser(user);
                return await render(userId);
            }
        },
        "/users/:userId/messages": {
            POST: async req => {
                const userId = req.params.userId;
                const users = await db.getUsers();
                const user = users.find(user => user.id === userId);
                if (!user) return new Response("Not Found", { status: 404 });

                const body = await req.formData();
                const text = body.get("text")?.toString();
                if (!text) return new Response("Bad Request", { status: 400 });

                await db.sendMessage(
                    {
                        id: user.tgUserId,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        username: user.tgUsername
                    },
                    text
                );

                return await render(userId);
            }
        }
    },
    fetch() {
        return new Response("Not Found", { status: 404 });
    }
});
console.log(`Listening on ${server.hostname}:${server.port}`);

export {};
