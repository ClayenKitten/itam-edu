import { Elysia, t } from "elysia";
import initContext from "../api/plugins";
import { REQUIRE_TOKEN } from "../api/plugins/docs";

export async function callsController() {
    return new Elysia({ tags: ["Calls"] })
        .use(initContext())
        .get(
            "/calls",
            async ({ error }) => {
                return error(501);
            },
            {
                detail: {
                    summary: "List calls",
                    description: "Returns list of all calls.",
                    security: REQUIRE_TOKEN
                },
                query: t.Partial(
                    t.Object({
                        course: t.String({ format: "uuid" }),
                        status: t.Union([
                            t.Literal("scheduled"),
                            t.Literal("ongoing"),
                            t.Literal("ended")
                        ])
                    })
                )
            }
        )
        .post(
            "/calls",
            async ({ error }) => {
                return error(501);
            },
            {
                detail: {
                    summary: "Start or schedule a call",
                    description: "Starts or schedules a call.",
                    security: REQUIRE_TOKEN
                }
            }
        )
        .get(
            "/calls/:call",
            async ({ error }) => {
                return error(501);
            },
            {
                detail: {
                    summary: "Get call information",
                    description:
                        "Returns information about the call, e.g. title, status, schedule, etc.",
                    security: REQUIRE_TOKEN
                }
            }
        )
        .patch(
            "/calls/:call",
            async ({ error }) => {
                return error(501);
            },
            {
                detail: {
                    summary: "Modify the call status and metadata",
                    description: "Modifies the call status and metadata.",
                    security: REQUIRE_TOKEN
                }
            }
        )
        .get(
            "/calls/:call/participants",
            async ({ error }) => {
                return error(501);
            },
            {
                detail: {
                    summary: "List call participants",
                    description: "Returns list of calls.",
                    security: REQUIRE_TOKEN
                }
            }
        )
        .post(
            "/calls/:call/participants",
            async ({ params, user, callRoom, callParticipant }) => {
                // const room = await callRoom.create(params.call);
                // console.log(room.name);
                const token = await callParticipant.join(user, params.call);
                return { token };
            },
            {
                requireAuthentication: true,
                detail: {
                    summary: "Join a call",
                    description: "Adds requesting user to the call.",
                    security: REQUIRE_TOKEN
                }
            }
        )
        .patch(
            "/calls/:call/participants/:participant",
            async ({ error }) => {
                return error(501);
            },
            {
                detail: {
                    summary: "Modify a participant state",
                    description: "Change participant state, e.g. mute/unmute",
                    security: REQUIRE_TOKEN
                }
            }
        );
}
