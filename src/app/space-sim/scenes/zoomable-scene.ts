import { Mouse } from "../utilities/mouse";

export abstract class ZoomableScene extends Phaser.Scene {
    protected mouse: Mouse;
    private _increment: number;
    private _minZoom: number;
    private _maxZoom: number;

    constructor(increment: number, config: Phaser.Types.Scenes.SettingsConfig) {
        super(config);
        this._increment = increment;
        this._minZoom = 1 - (increment * 2);
        this._maxZoom = 1;
    }

    public abstract preload(): void;

    public create(): void {
        this.mouse = new Mouse(this);
        this.mouse.onWheelUp((scrollAmount: number) => {
            let currentZoom: number = this.cameras.main.zoom;
            // zoom out
            let newZoom: number = currentZoom - this._increment;
            if (newZoom < this._minZoom) {
                newZoom = this._minZoom;
            }
            // console.log(`zooming from ${currentZoom} to ${newZoom}`);
            this.cameras.main.zoomTo(newZoom);
        });
        this.mouse.onWheelDown((scrollAmount: number) => {
            let currentZoom: number = this.cameras.main.zoom;
            // zoom in
            let newZoom: number = currentZoom + this._increment;
            if (newZoom > this._maxZoom) {
                newZoom = this._maxZoom;
            }
            // console.log(`zooming from ${currentZoom} to ${newZoom}`);
            this.cameras.main.zoomTo(newZoom);
        });
    }

    public abstract update(): void;
}