import { SpaceSimUserData } from "space-sim-shared";

export type SpaceSimServerUserData = SpaceSimUserData & {
    socketId: string;
    room: string;
}