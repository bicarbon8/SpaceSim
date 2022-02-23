import { Padding } from "./padding";

export interface TextButtonOptions {
    scene: Phaser.Scene;
    x: number;
    y: number;
    text?: string;
    textStyle?: Phaser.Types.GameObjects.Text.TextStyle;
    padding?: number | Padding;
    cornerRadius?: number;
    colour?: number;
    alpha?: number;
    minWidth?: number;
    minHeight?: number;
}