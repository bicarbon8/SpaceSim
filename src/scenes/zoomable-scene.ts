import { Mouse } from "../utilities/mouse";

export abstract class ZoomableScene extends Phaser.Scene {
    protected mouse: Mouse;
    private increment: number;
    private minZoom: number;
    private maxZoom: number;

    constructor(increment: number, config: Phaser.Types.Scenes.SettingsConfig) {
        super(config);
        this.increment = increment;
        this.minZoom = 1 - (increment * 2);
        this.maxZoom = 1;
    }

    public abstract preload(): void;

    public create(): void {
        this.mouse = new Mouse(this);
        this.mouse.onWheelUp((scrollAmount: number) => {
            let currentZoom: number = this.cameras.main.zoom;
            // zoom out
            let newZoom: number = currentZoom - this.increment;
            if (newZoom < this.minZoom) {
                newZoom = this.minZoom;
            }
            // console.log(`zooming from ${currentZoom} to ${newZoom}`);
            this.cameras.main.zoomTo(newZoom);
        });
        this.mouse.onWheelDown((scrollAmount: number) => {
            let currentZoom: number = this.cameras.main.zoom;
            // zoom in
            let newZoom: number = currentZoom + this.increment;
            if (newZoom > this.maxZoom) {
                newZoom = this.maxZoom;
            }
            // console.log(`zooming from ${currentZoom} to ${newZoom}`);
            this.cameras.main.zoomTo(newZoom);
        });
    }

    public abstract update(): void;
}