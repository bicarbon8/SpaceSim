import { HasLocation, Helpers } from "space-sim-server";
import { GameObjectPlus } from "space-sim-server";

export type MiniMapOptions = Phaser.Types.Math.Vector2Like & {
    width?: number;
    height?: number;
    zoom?: number;
    backgroundColor?: string | number | Phaser.Types.Display.InputColorObject;
    alpha?: number;
    followObject?: GameObjectPlus;
    ignore?: Array<Phaser.GameObjects.GameObject>;
};

export class MiniMap implements HasLocation {
    public static DEFAULT_OPTIONS: MiniMapOptions = {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        zoom: 0.02,
        backgroundColor: 'rgba(87, 227, 11, 0.5)',
        alpha: 0.5
    } as const;
    readonly scene: Phaser.Scene;

    private _cam: Phaser.Cameras.Scene2D.Camera;
    private _ignored: Set<Phaser.GameObjects.GameObject>;
    
    constructor(scene: Phaser.Scene, options?: MiniMapOptions) {
        this.scene = scene;
        this._ignored = new Set<Phaser.GameObjects.GameObject>();

        this._createCamera({
            ...MiniMap.DEFAULT_OPTIONS,
            ...options
        });

        this.ignore(...options.ignore);
    }

    getLocationInView(): Phaser.Math.Vector2 {
        return Helpers.vector2(this._cam.x, this._cam.y);
    }

    setLocationInView(location: Phaser.Types.Math.Vector2Like): void {
        this._cam.stopFollow();
        const loc = Helpers.convertLocInViewToLoc(location, this.scene);
        this._cam.setPosition(loc.x, loc.y);
    }

    getLocation(): Phaser.Math.Vector2 {
        return this._cam.getWorldPoint(0, 0);
    }

    setLocation(location: Phaser.Types.Math.Vector2Like): void {
        this._cam.stopFollow();
        this._cam.setPosition(location.x, location.y);
    }

    ignore(...entries: Array<Phaser.GameObjects.GameObject>): this {
        if (entries) {
            for (var i=0; i<entries.length; i++) {
                this._ignored.add(entries[i]);
            }
            this._cam.ignore(Array.from(this._ignored.values()));
        }
        return this;
    }

    unignore(...entries: Array<Phaser.GameObjects.GameObject>): this {
        if (entries) {
            for (var i=0; i<entries.length; i++) {
                this._ignored.delete(entries[i]);
            }
            this._cam.ignore(Array.from(this._ignored.values()));
        }
        return this;
    }

    follow(obj: GameObjectPlus): this {
        this._cam.centerOn(obj.x, obj.y)
            .startFollow(obj, true, 1, 1);
        return this;
    }

    stopFollowing(): this {
        this._cam.stopFollow();
        return this;
    }

    destroy(): void {
        try {
            this.scene.cameras.remove(this._cam, true);
        } catch (e) {
            console.warn('unable to cleanly remove MiniMap', e);
        }
    }

    private _createCamera(opts: MiniMapOptions): void {
        const maskGraphics = this.scene.make.graphics({x: opts.x, y: opts.y}, false)
            .fillStyle(0xffffff, 1)
            .fillCircle(0, 0, opts.width / 2);
        this._cam = this.scene.cameras.add(opts.x - (opts.width / 2), opts.y - (opts.height / 2), opts.width, opts.height, false, 'mini-map')
            .setZoom(opts.zoom)
            .setBackgroundColor(opts.backgroundColor)
            .setAlpha(opts.alpha)
            .setMask(maskGraphics.createGeometryMask());
        if (opts.followObject) {
            this.follow(opts.followObject);
        }
    }
}