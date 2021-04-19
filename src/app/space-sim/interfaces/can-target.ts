import { HasLocation } from "./has-location";

export interface CanTarget {
    setTarget<T extends HasLocation>(target: T): void;
    getTarget<T extends HasLocation>(): T;
    lookAt(location: Phaser.Math.Vector2): void;
}