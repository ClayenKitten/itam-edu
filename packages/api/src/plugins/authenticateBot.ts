import { Elysia } from "elysia";

export default function authenticateBot(botToken: string) {
    return new Elysia({ name: "authenticateBot" })
        .derive(async ({ headers, error }) => {
            let token = headers["authorization"];
            if (token === undefined) return error(401);

            token = token.replace(/^Bearer /, "");
            if (token !== botToken) return error(403);
        })
        .as("plugin");
}
