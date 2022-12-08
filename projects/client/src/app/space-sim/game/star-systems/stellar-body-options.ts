import { NumberOrRange } from "space-sim-server/src/app/interfaces/number-range";

export type StellarBodyOptions = {
    spriteName: 'sun' | 'mercury' | 'venus' | 'asteroids';
    rotationSpeed?: NumberOrRange; // degrees per second
    scale?: NumberOrRange;
    location?: Phaser.Math.Vector2;
    scrollFactor?: NumberOrRange; // 0 = moves with camera (far away), 1 = moves normally (close)
};