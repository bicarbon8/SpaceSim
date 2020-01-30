export interface CanThrust {
    getHeading(): Phaser.Math.Vector2;
    getVelocity(): number;
    thrustFowards(): void;
    strafeLeft(): void;
    strafeRight(): void;
    thrustBackwards(): void;
}
