import { HasLocation } from "./has-location";

export type CanTarget = {
    lookAt(target: Phaser.Types.Math.Vector2Like): void;
};