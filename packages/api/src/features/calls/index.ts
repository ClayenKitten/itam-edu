import type { CallPermissions } from "./policy";

export type RoomMetadata = {
    title: string;
};

export type ParticipantMetadata = {
    permissions: CallPermissions;
};
