import { Input } from "phaser";
import { MouseTracker } from "../utilities/mouse-tracker";

export abstract class ZoomableScene extends Phaser.Scene {
    private _mouse: MouseTracker;
    private _increment: number;
    private _minZoom: number;
    private _maxZoom: number;

    constructor(increment: number, config: Phaser.Types.Scenes.SettingsConfig) {
        super(config);
        this._increment = increment;
        this._minZoom = 1 - (increment * 2);
        this._maxZoom = 1;
    }

    get mouse(): MouseTracker {
        return this._mouse;
    }

    public abstract preload(): void;

    public create(): void {
        this._mouse = new MouseTracker(this);
        this.input.on(Input.Events.POINTER_WHEEL, (pointer: Phaser.Input.Pointer, currentlyOver: any, dx: number, dy: number, dz: number, event: Event) => {
            if (dy > 0) {
                this.zoomOut();
            }
        });
        this.input.on(Input.Events.POINTER_WHEEL, (pointer: Phaser.Input.Pointer, currentlyOver: any, dx: number, dy: number, dz: number, event: Event) => {
            if (dy < 0) {
                this.zoomIn();
            }
        });
    }

    zoomIn(): void {
        let currentZoom: number = this.cameras.main.zoom;
        // zoom in
        let newZoom: number = currentZoom + this._increment;
        if (newZoom > this._maxZoom) {
            newZoom = this._maxZoom;
        }
        // console.log(`zooming from ${currentZoom} to ${newZoom}`);
        this.cameras.main.zoomTo(newZoom);
    }

    zoomOut(): void {
        let currentZoom: number = this.cameras.main.zoom;
        // zoom out
        let newZoom: number = currentZoom - this._increment;
        if (newZoom < this._minZoom) {
            newZoom = this._minZoom;
        }
        // console.log(`zooming from ${currentZoom} to ${newZoom}`);
        this.cameras.main.zoomTo(newZoom);
    }

    public abstract update(): void;
}