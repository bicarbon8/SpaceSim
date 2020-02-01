export interface HasLocation {
    getAngle(): number;
    getRotation(): number;
    getHeading(): Phaser.Math.Vector2;
    getVelocity(): number;
    getLocation(): Phaser.Math.Vector2;
    getRealLocation(): Phaser.Math.Vector2;
}