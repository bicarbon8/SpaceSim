export type PhysicsObject = {
    readonly location: Phaser.Types.Math.Vector2Like;
    readonly velocity: Phaser.Types.Math.Vector2Like;
    readonly angle: number;
    readonly angularVelocity: number;
}