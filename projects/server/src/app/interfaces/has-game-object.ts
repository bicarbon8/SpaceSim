export type HasGameObject<T extends Phaser.GameObjects.GameObject> = {
    getGameObject(): T;
};