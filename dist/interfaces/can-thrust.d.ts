export interface CanThrust {
    getHeading(): Phaser.Math.Vector2;
    thrustFowards(): void;
    strafeLeft(): void;
    strafeRight(): void;
    thrustBackwards(): void;
}
