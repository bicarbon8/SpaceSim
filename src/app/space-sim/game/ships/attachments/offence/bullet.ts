import { HasGameObject } from "../../../interfaces/has-game-object";
import { BulletOptions } from "../../../interfaces/bullet-options";
import { HasLocation } from "../../../interfaces/has-location";
import { Helpers } from "../../../utilities/helpers";
import { SpaceSim } from "../../../space-sim";
import { ShipPod } from "../../ship-pod";
import { Constants } from "../../../utilities/constants";
import { OffenceAttachment } from "./offence-attachment";
import { GameScoreTracker } from "../../../utilities/game-score-tracker";

export class Bullet implements HasGameObject<Phaser.GameObjects.Sprite>, HasLocation {
    readonly id: string;
    private _scene: Phaser.Scene;
    private _force: number;
    private _damage: number;
    private _gameObj: Phaser.GameObjects.Sprite;
    private _scale: number;
    private _origin: OffenceAttachment;
    private _hitSound: Phaser.Sound.BaseSound;
    private _timeout: number;

    active: boolean;
    
    constructor(options: BulletOptions) {
        this.id = Phaser.Math.RND.uuid();
        this.active = true;
        this._scene = options.scene;
        this._origin = options.attachment;
        this._force = options.force ?? 1;
        this._damage = options.damage ?? 1;
        this._scale = options.scale ?? 1;
        this._timeout = options.timeout ?? 5000;
        
        this._createGameObj(options);

        this._hitSound = this._scene.sound.add('bullet-hit');
        
        const startingA: number = options.angle || 0;
        this.getGameObject().setAngle(startingA);
        const startingV: Phaser.Math.Vector2 = options.startingV || Phaser.Math.Vector2.ZERO;
        this.getPhysicsBody().setVelocity(startingV.x, startingV.y);
        this.getPhysicsBody().setBounce(0, 0);
        this.addCollisionDetection();

        GameScoreTracker.shotFired();
        this._setInMotion();
    }

    private addCollisionDetection(): void {
        this._scene.physics.add.collider(this.getGameObject(), SpaceSim.map.getGameObject(), () => {
            this.getGameObject().active = false;
            this.getGameObject().destroy();
        });
        SpaceSim.opponents.forEach((opp: ShipPod) => {
            this._scene.physics.add.collider(this.getGameObject(), opp.getGameObject(), () => {
                this._hitSound.play();
                this.getGameObject().active = false;
                this.getGameObject().destroy();
                opp.sustainDamage({
                    amount: this._damage, 
                    timestamp: this._scene.time.now,
                    attackerId: this._origin.ship.id,
                    message: `projectile hit`
                });
                GameScoreTracker.shotLanded();
            });
        });
    }

    getGameObject(): Phaser.GameObjects.Sprite {
        return this._gameObj;
    }

    getPhysicsBody(): Phaser.Physics.Arcade.Body {
        return this.getGameObject()?.body as Phaser.Physics.Arcade.Body;
    }

    getRotation(): number {
        return this.getGameObject()?.angle || 0;
    }

    getHeading(): Phaser.Math.Vector2 {
        return Helpers.getHeading(this.getRotation());
    }

    getSpeed(): number {
        return this.getVelocity().length();
    }

    getVelocity(): Phaser.Math.Vector2 {
        return this.getPhysicsBody()?.velocity?.clone() || Helpers.vector2();
    }

    getLocationInView(): Phaser.Math.Vector2 {
        let cameraPos: Phaser.Math.Vector2 = this._scene.cameras.main.getWorldPoint(0, 0);
        let loc: Phaser.Math.Vector2 = this.getLocation();
        return new Phaser.Math.Vector2(loc.x - cameraPos.x, loc.y - cameraPos.y);
    }

    getLocation(): Phaser.Math.Vector2 {
        if (this.getGameObject()) {
            return Helpers.vector2(this.getGameObject().x, this.getGameObject().y);
        }
        return Helpers.vector2();
    }

    setLocation(location: Phaser.Math.Vector2): void {
        let go: Phaser.GameObjects.Sprite = this.getGameObject();
        if (go) {
            go.x = location.x;
            go.y = location.y;
        }
    }

    private _setInMotion(): void {
        let heading: Phaser.Math.Vector2 = this.getHeading();
        // add force to heading
        let deltaV: Phaser.Math.Vector2 = heading.multiply(Helpers.vector2(this._force));
        // add deltaV to current Velocity
        this.getPhysicsBody().velocity.add(deltaV);

        setTimeout(() => this.getGameObject()?.destroy(), this._timeout);
    }

    private _createGameObj(options: BulletOptions): void {
        this._gameObj = this._scene.add.sprite(0, 0, options.spriteName);
        this._gameObj.setDepth(Constants.DEPTH_PLAYER);
        this.setLocation(options.location);
        this._gameObj.setScale(this._scale);
        this._scene.physics.add.existing(this._gameObj);

        this.getPhysicsBody().setMass(0.01);
    }
}