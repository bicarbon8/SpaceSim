import { Helpers } from "space-sim-shared";

export type SpaceSimClientOptions = {
    debug?: boolean;
    loglevel?: Helpers.LogLevel;
    width?: number;
    height?: number;
    parentElementId?: string;
};