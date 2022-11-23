import { HasGameObject } from "../../../interfaces/has-game-object";
import { BulletOptions } from "../../../interfaces/bullet-options";
import { HasLocation } from "../../../interfaces/has-location";
import { Helpers } from "../../../utilities/helpers";
import { SpaceSim } from "../../../space-sim";
import { ShipPod } from "../../ship-pod";
import { Constants } from "../../../utilities/constants";
import { OffenceAttachment } from "./offence-attachment";
import { GameScoreTracker } from "../../../utilities/game-score-tracker";

export class Bullet implements BulletOptions, HasGameObject<Phaser.GameObjects.Sprite>, HasLocation {
    readonly id: string;
    readonly scene: Phaser.Scene;
    readonly location: Phaser.Math.Vector2;
    readonly force: number;
    readonly damage: number;
    readonly scale: number;
    readonly spriteName: string;
    readonly attachment: OffenceAttachment;
    readonly timeout: number;
    readonly mass: number;

    active: boolean;

    private _gameObj: Phaser.GameObjects.Sprite;
    private _hitSound: Phaser.Sound.BaseSound;
    
    constructor(options: BulletOptions) {
        this.id = Phaser.Math.RND.uuid();
        this.active = true;
        this.scene = options.scene;
        this.attachment = options.attachment;
        this.spriteName = options.spriteName;
        this.force = options.force ?? 1;
        this.damage = options.damage ?? 1;
        this.scale = options.scale ?? 1;
        this.timeout = options.timeout ?? 5000;
        this.mass = options.mass ?? 0;
        
        this._createGameObj(options);

        this._hitSound = this.scene.sound.add('bullet-hit');
        
        const startingA: number = options.angle ?? 0;
        this.getGameObject().setAngle(startingA);
        const startingV: Phaser.Math.Vector2 = options.startingV || Phaser.Math.Vector2.ZERO;
        this.getPhysicsBody().setVelocity(startingV.x, startingV.y);
        this.getPhysicsBody().setBounce(0, 0);
        this.addCollisionDetection();

        GameScoreTracker.shotFired();
        this._setInMotion();
    }

    private addCollisionDetection(): void {
        this.scene.physics.add.collider(this.getGameObject(), SpaceSim.map.getGameObject(), () => {
            this.destroy();
        });
        SpaceSim.opponents.forEach((opp: ShipPod) => {
            this.scene.physics.add.collider(this.getGameObject(), opp.getGameObject(), () => {
                this._hitSound.play();
                this._createHitParticles();
                this.destroy();
                opp.sustainDamage({
                    amount: this.damage, 
                    timestamp: this.scene.time.now,
                    attackerId: this.attachment.ship.id,
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
        let cameraPos: Phaser.Math.Vector2 = this.scene.cameras.main.getWorldPoint(0, 0);
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

    destroy() {
        try {
            this.getGameObject().active = false;
            this.getGameObject().destroy();
        } catch (e) {
            /* ignore */
        }
    }

    private _setInMotion(): void {
        let heading: Phaser.Math.Vector2 = this.getHeading();
        // add force to heading
        let deltaV: Phaser.Math.Vector2 = heading.multiply(Helpers.vector2(this.force));
        // add deltaV to current Velocity
        this.getPhysicsBody().velocity.add(deltaV);
        // ensure bullet is destroyed after `timeout` milliseconds if no collisions
        window.setTimeout(() => this.destroy(), this.timeout);
    }

    private _createGameObj(options: BulletOptions): void {
        this._gameObj = this.scene.add.sprite(0, 0, options.spriteName);
        this._gameObj.setDepth(Constants.UI.Layers.PLAYER);
        this.setLocation(options.location);
        this._gameObj.setScale(this.scale);
        this.scene.physics.add.existing(this._gameObj);

        this.getPhysicsBody().setMass(this.mass);
    }

    private _createHitParticles(): void {
        const explosion = this.scene.add.particles('explosion');
        let pos: Phaser.Math.Vector2 = this.getLocation();
        explosion.createEmitter({
            x: pos.x,
            y: pos.y,
            lifespan: { min: 200, max: 300 },
            speedX: { min: -1, max: 1 },
            speedY: { min: -1, max: 1 },
            angle: { min: -180, max: 179 },
            gravityX: 0,
            gravityY: 0,
            scale: { start: 0.5, end: 0 },
            blendMode: 'ADD',
            maxParticles: 3
        });
    }
}