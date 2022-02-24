export interface StellarBodyOptions {
    spriteName: string;
    rotationSpeed?: number; // degrees per second
    scale?: number;
    location?: Phaser.Math.Vector2;
    scrollFactor?: number; // 0 = moves with camera (far away), 1 = moves normally (close)
}