import { HasLocation, Helpers, TryCatch } from "space-sim-shared";

export type CameraOptions = Phaser.Types.Math.Vector2Like & {
    camera?: Phaser.Cameras.Scene2D.Camera;
    name?: string;
    width?: number;
    height?: number;
    zoom?: number;
    backgroundColor?: string | number | Phaser.Types.Display.InputColorObject;
    alpha?: number;
    followObject?: Phaser.GameObjects.GameObject;
    ignore?: Array<Phaser.GameObjects.GameObject>;
};

export class Camera implements HasLocation {
    readonly scene: Phaser.Scene;

    private _cam: Phaser.Cameras.Scene2D.Camera;
    private _ignored: Phaser.GameObjects.Group;

    constructor(scene: Phaser.Scene, options?: CameraOptions) {
        this.scene = scene;
        
        const opts: CameraOptions = {
            ...this._defaultOptions(this.scene),
            ...options
        };
        
        this._ignored = this.scene.add.group()
            .setName(`${opts.name ?? 'camera'}-ignore-group`);
        
        this._cam = this._getCamera(opts);

        this.ignore(...opts.ignore);
        this.follow(opts.followObject);
    }

    get cam(): Phaser.Cameras.Scene2D.Camera {
        return this._cam;
    }

    get locationInView(): Phaser.Types.Math.Vector2Like {
        return Helpers.vector2(this._cam.x, this._cam.y);
    }

    setLocationInView(location: Phaser.Types.Math.Vector2Like): void {
        this._cam.stopFollow();
        const loc = Helpers.convertLocInViewToLoc(location, this.scene);
        this._cam.setPosition(loc.x, loc.y);
    }

    get location(): Phaser.Types.Math.Vector2Like {
        return this._cam.getWorldPoint(0, 0);
    }

    setLocation(location: Phaser.Types.Math.Vector2Like): void {
        this._cam.stopFollow();
        this._cam.setPosition(location.x, location.y);
    }

    ignore(...entries: Array<Phaser.GameObjects.GameObject>): this {
        if (entries?.length) {
            this._ignored.addMultiple(entries);
            this._cam.ignore(this._ignored.getChildren());
        }
        return this;
    }

    unignore(...entries: Array<Phaser.GameObjects.GameObject>): this {
        if (entries?.length) {
            for (var i=0; i<entries.length; i++) {
                TryCatch.run(() => this._ignored.remove(entries[i]));
            }
            this._cam.ignore(this._ignored.getChildren());
        }
        return this;
    }

    clearAllIgnored(): this {
        this.unignore(...this._ignored.getChildren());
        return this;
    }

    follow(obj: Phaser.GameObjects.GameObject): this {
        if (obj) {
            this._cam.centerOn(obj['x'], obj['y'])
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
            .setAlpha(opts.alpha);
        return cam;
    }

    destroy(): void {
        TryCatch.run(() => {
            this.unignore(...this._ignored.getChildren())
            this._ignored.destroy();
        }, 'warn');
    }

    private _defaultOptions(scene: Phaser.Scene): CameraOptions {
        return {
            x: 0,
            y: 0,
            width: scene.game.scale.displaySize.width,
            height: scene.game.scale.displaySize.height,
            zoom: 1,
            alpha: 1,
            ignore: []
        }
    }
}