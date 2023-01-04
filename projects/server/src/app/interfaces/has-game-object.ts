export type HasGameObject<T extends Phaser.GameObjects.GameObject> = {
    getGameObject(): T;
    getRotation(): number;
    setRotation(degrees: number): void;
};