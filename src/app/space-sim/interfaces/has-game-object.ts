export interface HasGameObject<T extends Phaser.GameObjects.GameObject> {
    getGameObject(): T;
    getPhysicsBody(): Phaser.Physics.Arcade.Body;
}