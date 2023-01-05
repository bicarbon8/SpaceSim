import { GameObjectPlus, HasLocation, Helpers } from "space-sim-server";

export type CameraOptions = Phaser.Types.Math.Vector2Like & {
    camera?: Phaser.Cameras.Scene2D.Camera;
    name?: string;
    width?: number;
    height?: number;
    zoom?: number;
    backgroundColor?: string | number | Phaser.Types.Display.InputColorObject;
    alpha?: number;
    followObject?: GameObjectPlus;
    ignore?: Array<Phaser.GameObjects.GameObject>;
};

export class Camera implements HasLocation {
    readonly scene: Phaser.Scene;

    private _cam: Phaser.Cameras.Scene2D.Camera;
    private _ignored: Phaser.GameObjects.Group;

    constructor(scene: Phaser.Scene, options?: CameraOptions) {
        this.scene = scene;
        this._ignored = this.scene.add.group(options.ignore || [], {
            name: `${options.name ?? 'camera'}-ignore-group`
        });
        
        this._cam = this._getCamera({
            ...this._defaultOptions(this.scene),
            ...options
        });

        this.ignore(...options.ignore);
        this.follow(options.followObject);
    }

    get cam(): Phaser.Cameras.Scene2D.Camera {
        return this._cam;
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
        if (entries?.length) {
            for (var i=0; i<entries.length; i++) {
                this._ignored.add(entries[i]);
            }
        }
        return this;
    }

    unignore(...entries: Array<Phaser.GameObjects.GameObject>): this {
        if (entries?.length) {
            for (var i=0; i<entries.length; i++) {
                Helpers.trycatch(() => this._ignored.remove(entries[i]));
            }
        }
        return this;
    }

    follow(obj: GameObjectPlus): this {
        if (obj) {
            this._cam.centerOn(obj.x, obj.y)
                .startFollow(obj, true, 1, 1);
        }
        return this;
    }

    stopFollowing(): this {
        this._cam.stopFollow();
        return this;
    }

    protected _getCamera(opts: CameraOptions): Phaser.Cameras.Scene2D.Camera {
        const cam = opts.camera ?? this.scene.cameras.main;
        cam.setName(opts.name)
            .setZoom(opts.zoom)
            .setPosition(opts.x, opts.y)
            .setSize(opts.width, opts.height)
            .setBackgroundColor(opts.backgroundColor)
            .setAlpha(opts.alpha)
            .ignore(this._ignored);
        return cam;
    }

    destroy(): void {
        /* ignored */
    }

    private _defaultOptions(scene: Phaser.Scene): CameraOptions {
        return {
            x: 0,
            y: 0,
            width: scene.game.scale.displaySize.width,
            height: scene.game.scale.displaySize.height,
            zoom: 1,
            alpha: 1
        }
    }
}