import { Logging } from "space-sim-shared";

export type SpaceSimClientOptions = {
    debug?: boolean;
    loglevel?: Logging.LogLevel;
    width?: number;
    height?: number;
    parentElementId?: string;
};