import { ZoomableScene } from "./zoomable-scene";
export declare class SystemScene extends ZoomableScene {
    sun: Phaser.GameObjects.Sprite;
    startPosition: Phaser.Math.Vector2;
    constructor();
    preload(): void;
    create(): void;
    update(): void;
}
