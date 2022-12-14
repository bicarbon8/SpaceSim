import { HasLocation } from "./has-location";

export type CanTarget = {
    readonly target: HasLocation;
    setTarget(target: HasLocation): void;
    lookAtTarget(): void;
};