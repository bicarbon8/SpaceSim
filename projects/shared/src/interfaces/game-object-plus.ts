export type GameObjectPlus = Phaser.GameObjects.GameObject & {
    x?: number;
    y?: number;
    height?: number;
    width?: number;
    displayWidth?: number;
    displayHeight?: number;
    origin?: number;
}