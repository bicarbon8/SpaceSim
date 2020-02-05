import { Mouse } from "../utilities/mouse";

export abstract class ZoomableScene extends Phaser.Scene {
    protected mouse: Mouse;

    constructor(config: Phaser.Types.Scenes.SettingsConfig) {
        super(config);
    }

    public abstract preload(): void;

    public create(): void {
        this.mouse = new Mouse(this);
        this.mouse.onWheelUp((scrollAmount: number) => {
            let currentZoom: number = this.cameras.main.zoom;
            // zoom out
            let newZoom: number = currentZoom - 0.5;
            if (newZoom < 0.1) {
                newZoom = 0.1;
            }
            // console.log(`zooming from ${currentZoom} to ${newZoom}`);
            this.cameras.main.zoomTo(newZoom);
        });
        this.mouse.onWheelDown((scrollAmount: number) => {
            let currentZoom: number = this.cameras.main.zoom;
            // zoom in
            let newZoom: number = currentZoom + 0.5;
            if (newZoom > 1) {
                newZoom = 1;
            }
            // console.log(`zooming from ${currentZoom} to ${newZoom}`);
            this.cameras.main.zoomTo(newZoom);
        });
    }

    public abstract update(): void;
}