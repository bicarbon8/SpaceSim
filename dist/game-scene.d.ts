export declare class GameScene extends Phaser.Scene {
    private player;
    isPaused: boolean;
    inputKeys: Phaser.Types.Input.Keyboard.CursorKeys;
    mouseLocation: Phaser.Math.Vector2;
    constructor();
    preload(): void;
    create(): void;
    update(): void;
}
