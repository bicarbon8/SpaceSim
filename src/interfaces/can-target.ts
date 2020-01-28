import { HasLocation } from "./has-location";

export interface CanTarget {
    setTarget(target: HasLocation): void;
    lookAtTarget(): void;
}