import { HasLocation } from "./has-location";

export type CanTarget = {
    target: HasLocation;
    lookAtTarget(): void;
};