export interface HasPhysicsBody {
    getPhysicsBody(): Phaser.Physics.Arcade.Body;
    getHeading(): Phaser.Math.Vector2;
    getSpeed(): number;
    getVelocity(): Phaser.Math.Vector2;
}