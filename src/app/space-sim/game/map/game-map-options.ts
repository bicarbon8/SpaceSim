export interface GameMapOptions {
    scene: Phaser.Scene;
    width?: number;
    height?: number;
    seed?: string;
    roomMinWidth?: number;
    roomMinHeight?: number;
    roomMaxWidth?: number;
    roomMaxHeight?: number;
    doorPadding?: number;
    maxRooms?: number;
    layerDepth?: number;
}