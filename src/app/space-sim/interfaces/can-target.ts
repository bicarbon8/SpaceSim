import { HasLocation } from "./has-location";

export interface CanTarget {
    setTarget<T extends HasLocation>(target: T): void;
    getTarget<T extends HasLocation>(): T;
    lookAt<T extends HasLocation>(obj: T): void;
}