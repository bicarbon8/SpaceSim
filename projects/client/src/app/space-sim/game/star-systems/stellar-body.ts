import { HasGameObject, Updatable, Constants, Helpers, NumberOrRange } from "space-sim-shared";
import { environment } from "../../../../environments/environment";

export type StellarBodyOptions = {
    spriteName: 'sun' | 'mercury' | 'venus' | 'asteroids';
    rotationSpeed?: NumberOrRange; // degrees per second
    scale?: NumberOrRange;
    location?: Phaser.Math.Vector2;
    scrollFactor?: NumberOrRange; // 0 = moves with camera (far away), 1 = moves normally (close)
};

export class StellarBody implements Updatable, HasGameObject<Phaser.GameObjects.Sprite> {
    readonly id: string;
    active: boolean;

    private _scene: Phaser.Scene;
    private _gameObj: Phaser.GameObjects.Sprite;
    
    readonly spriteName: string;
    readonly location: Phaser.Math.Vector2;
    readonly scale: number;
    readonly scrollFactor: number;
    readonly rotationSpeed: number; // in degrees per second

    static preload(scene: Phaser.Scene): void {
        scene.load.image('sun', `${environment.baseUrl}/assets/backgrounds/sun.png`);
        scene.load.image('venus', `${environment.baseUrl}/assets/backgrounds/venus.png`);
        scene.load.image('mercury', `${environment.baseUrl}/assets/backgrounds/mercury.png`);
        scene.load.spritesheet('asteroids', `${environment.baseUrl}/assets/tiles/asteroids-tile.png`, {
            frameWidth: 100,
            frameHeight: 100,
            startFrame: 0,
            endFrame: 63,
            margin: 14,
            spacing: 28
        });
    }
    
    constructor(scene: Phaser.Scene, options: StellarBodyOptions) {
        this.id = Phaser.Math.RND.uuid();
        this.active = true;
        this._scene = scene;

        this.spriteName = options.spriteName;
        this.location = options.location || Helpers.vector2();
        this.rotationSpeed = Helpers.getRealNumber(options.rotationSpeed) ?? Phaser.Math.RND.realInRange(0.1, 1);
        this.scale = Helpers.getRealNumber(options.scale) ?? Phaser.Math.RND.realInRange(0.1, 3);
        this.scrollFactor = Helpers.getRealNumber(options.scrollFactor) ?? Phaser.Math.RND.realInRange(0.05, 0.5);
        
        this._createGameObj();
    }

    update(time: number, delta: number): void {
        if (this.active && this.rotationSpeed !== 0) {
            let go: Phaser.GameObjects.Sprite = this.getGameObject();
            if (go) {
                go.angle += this.rotationSpeed / delta;
                if (go.angle >= 360) {
                    go.angle = 0;
                }
            }
        }
    }

    getRotation(): number {
        return this.getGameObject()?.angle ?? 0;
    }

    setRotation(degrees: number): void {
        this.getGameObject()?.setAngle(degrees);
    }
    
    getLocationInView(): Phaser.Math.Vector2 {
        return Helpers.convertLocToLocInView(this.getLocation(), this._scene);
    }
    
    getLocation(): Phaser.Math.Vector2 {
        let go: Phaser.GameObjects.Sprite = this.getGameObject();
        if (go) {
            return Helpers.vector2(go.x, go.y);
        }
        return Phaser.Math.Vector2.ZERO;
    }

    getGameObject(): Phaser.GameObjects.Sprite {
        return this._gameObj;
    }

    getPhysicsBody(): Phaser.Physics.Arcade.Body {
        return undefined;
    }

    private _createGameObj(): void {
        if (this.spriteName === 'asteroids') {
            this._gameObj = this._scene.add.sprite(
                this.location.x * (1/this.scrollFactor), 
                this.location.y * (1/this.scrollFactor), 
                this.spriteName, 
                Phaser.Math.RND.between(0, 63)
            );
        } else {
            this._gameObj = this._scene.add.sprite(
                this.location.x * (1/this.scrollFactor), 
                this.location.y * (1/this.scrollFactor), 
                this.spriteName
            );
        }
        this._gameObj.setScale(this.scale, this.scale);
        this._gameObj.setScrollFactor(this.scrollFactor);
        this._gameObj.setDepth(Constants.UI.Layers.STELLAR);
        if (this.spriteName === 'sun') {
            this._gameObj.setDepth(this._gameObj.depth - 0.3); // ensure Sun is behind planets always
        }
        if (this.spriteName === 'venus') {
            this._gameObj.setDepth(this._gameObj.depth - 0.2); // ensure Venus is behind rocky planets
        }
        if (this.spriteName === 'mercury') {
            this._gameObj.setDepth(this._gameObj.depth - 0.1); // ensure Mercury is behind asteroids
        }
    }
}