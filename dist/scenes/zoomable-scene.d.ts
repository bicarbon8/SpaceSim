import { Mouse } from "../utilities/mouse";
export declare abstract class ZoomableScene extends Phaser.Scene {
    protected mouse: Mouse;
    private increment;
    private minZoom;
    private maxZoom;
    constructor(increment: number, config: Phaser.Types.Scenes.SettingsConfig);
    abstract preload(): void;
    create(): void;
    abstract update(): void;
}
