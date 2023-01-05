import { Constants, Helpers } from "space-sim-server";
import { Camera, CameraOptions } from "./camera";

export type MiniMapOptions = Omit<CameraOptions, 'name' | 'zoom'> & {
    
};

export class MiniMap extends Camera {
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
    
    constructor(scene: Phaser.Scene, options?: MiniMapOptions) {
        super(scene, {
            ...MiniMap.DEFAULT_OPTIONS,
            ...options
        });
    }

    protected override _getCamera(opts: MiniMapOptions): Phaser.Cameras.Scene2D.Camera {
        const cam = super._getCamera({
            camera: opts.camera ?? this.scene.cameras.add(0, 0, opts.width, opts.height, false),
            ...opts,
            x: opts.x - (opts.width / 2),
            y: opts.y - (opts.height / 2)
        });
        const maskGraphics = this.scene.make.graphics({x: opts.x, y: opts.y}, false)
            .fillStyle(0xffffff, 1)
            .fillCircle(0, 0, opts.width / 2);
        cam.setMask(maskGraphics.createGeometryMask());
        this._border = this.scene.add.graphics()
            .lineStyle(3, 0x57e30b, 1)
            .setScrollFactor(0)
            .strokeCircle(opts.x, opts.y, opts.width / 2)
            .setDepth(Constants.UI.Layers.HUD);

        return cam;
    }

    override destroy(): void {
        Helpers.trycatch(() => {
            this.scene.cameras.remove(this.cam, true);
            this._border.destroy();
        }, 'warn', 'unable to cleanly remove MiniMap');
    }
}