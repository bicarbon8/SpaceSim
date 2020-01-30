export interface CanThrust {
    getHeading(): Phaser.Math.Vector2;
    getVelocity(): number;
    thrustFowards(): void;
    boostForwards(): void;
    strafeLeft(): void;
    strafeRight(): void;
    thrustBackwards(): void;
}
