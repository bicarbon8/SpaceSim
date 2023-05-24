import { TryCatch } from "space-sim-shared";
import { SpaceSimClient } from "../space-sim-client";
import { Camera, CameraOptions } from "./camera";

export type RadarOptions = Omit<CameraOptions, 'name' | 'zoom'> & {
    
};

export class Radar extends Camera {
    private _mask: Phaser.GameObjects.Graphics;
    private _border: Phaser.GameObjects.Graphics;
    private static DEFAULT_OPTIONS: CameraOptions = {
        name: 'minimap',
        zoom: 0.04,
        x: 0,
        y: 0,
        width: 150,
        height: 150,
        backgroundColor: 'rgba(87, 227, 11, 0.5)',
        alpha: 0.5
    } as const;
    
    constructor(scene: Phaser.Scene, options?: RadarOptions) {
        super(scene, {
            ...Radar.DEFAULT_OPTIONS,
            ...options
        });
    }

    protected override _getCamera(opts: RadarOptions): Phaser.Cameras.Scene2D.Camera {
        const radius = opts.width / 2;
        const cam = super._getCamera({
            camera: opts.camera ?? this.scene.cameras.add(0, 0, opts.width, opts.height, false),
            ...opts,
            x: opts.x - radius,
            y: opts.y - (opts.height / 2)
        });
        this._mask = this.scene.make.graphics({x: opts.x, y: opts.y}, false)
            .fillStyle(0xffffff, 1)
            .fillCircle(0, 0, radius);
        cam.setMask(this._mask.createGeometryMask());
        const mainCamZoom = this.scene.cameras.main.zoom;
        if (Phaser.Math.Fuzzy.Equal(mainCamZoom, 1, 0.1)) {
            this._border = this.scene.add.graphics()
                .lineStyle(3, 0x57e30b, 1)
                .setScrollFactor(0)
                .strokeCircle(opts.x, opts.y, radius)
                .setDepth(SpaceSimClient.Constants.UI.Layers.HUD);
        }

        return cam;
    }

    override destroy(): void {
        super.destroy();
        TryCatch.run(() => {
            this.scene.cameras.remove(this.cam, true);
            this._mask?.destroy();
            this._border?.destroy();
        }, 'warn', 'unable to cleanly remove Radar');
    }
}