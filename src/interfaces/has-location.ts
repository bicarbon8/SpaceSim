export interface HasLocation {
    getRotation(): number;
    getHeading(): Phaser.Math.Vector2;
    getSpeed(): number;
    getVelocity(): Phaser.Math.Vector2;
    getLocation(): Phaser.Math.Vector2;
    getRealLocation(): Phaser.Math.Vector2;
}