export type DynamicGameObject = Phaser.GameObjects.GameObject & {
    location: Phaser.Types.Math.Vector2Like;
    heading: Phaser.Types.Math.Vector2Like;
}