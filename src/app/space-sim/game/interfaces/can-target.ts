import { HasLocation } from "./has-location";

export interface CanTarget {
    target: HasLocation;
    lookAtTarget(): void;
}