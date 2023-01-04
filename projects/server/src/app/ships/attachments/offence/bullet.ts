import { HasGameObject } from "../../../interfaces/has-game-object";
import { BulletOptions } from "./bullet-options";
import { HasLocation } from "../../../interfaces/has-location";
import { Helpers } from "../../../utilities/helpers";
import { SpaceSim } from "../../../space-sim";
import { Ship } from "../../ship";
import { Constants } from "../../../utilities/constants";
import { Weapons } from "./weapons";
import { GameScoreTracker } from "../../../utilities/game-score-tracker";
import { Exploder } from "../../../utilities/exploder";

export class Bullet implements BulletOptions, HasGameObject<Phaser.GameObjects.Container>, HasLocation {
    readonly id: string;
    readonly scene: Phaser.Scene;
    readonly force: number;
    readonly damage: number;
    readonly scale: number;
    readonly spriteName: string;
    readonly weapon: Weapons;
    readonly timeout: number;
    readonly mass: number;

    active: boolean;

    private _startLoc: Phaser.Math.Vector2;
    private _gameObj: Phaser.GameObjects.Container;
    private _hitSound: Phaser.Sound.BaseSound;
    
    constructor(options: BulletOptions) {
        this.id = Phaser.Math.RND.uuid();
        this.active = true;
        this.scene = options.scene;
        this._startLoc = options.location || Helpers.vector2();
        this.weapon = options.weapon;
        this.spriteName = options.spriteName;
        this.force = options.force ?? 1;
        this.damage = options.damage ?? 1;
        this.scale = options.scale ?? 1;
        this.timeout = options.timeout ?? 500;
        this.mass = options.mass ?? 0;
        
        this._createGameObj();

        const startingA: number = options.angle ?? 0;
        this.getGameObject().setAngle(startingA);
        const startingV: Phaser.Math.Vector2 = options.startingV || Phaser.Math.Vector2.ZERO;
        this.getPhysicsBody().setVelocity(startingV.x, startingV.y);
        this.getPhysicsBody().setBounce(0, 0);
        this.addCollisionDetection();

        GameScoreTracker.shotFired(this.weapon.ship.id);
        this._setInMotion();
    }

    get location(): Phaser.Math.Vector2 {
        return this.getLocation();
    }

    private addCollisionDetection(): void {
        this.scene.physics.add.collider(this.getGameObject(), SpaceSim.map.getGameObject(), () => {
            this.destroy();
        });
        const dist = this.getRange();
        SpaceSim.map.getActiveShipsWithinRadius(this.getLocation(), dist * 2)
            .forEach((opp: Ship) => {
                if (opp.id !== this.weapon.ship.id) {
                    this.scene.physics.add.collider(this.getGameObject(), opp.getGameObject(), () => {
                        this._hitSound?.play();
                        new Exploder(this.scene).explode({
                            location: this.getLocation(),
                            scale: 0.25
                        });
                        this.destroy();
                        opp.sustainDamage({
                            amount: this.damage, 
                            timestamp: this.scene.time.now,
                            attackerId: this.weapon.ship.id,
                            message: `projectile hit`
                        });
                        GameScoreTracker.shotLanded(this.weapon.ship.id);
                    });
                }
            });
    }

    getGameObject(): Phaser.GameObjects.Container {
        return this._gameObj;
    }

    getPhysicsBody(): Phaser.Physics.Arcade.Body {
        return this.getGameObject()?.body as Phaser.Physics.Arcade.Body;
    }

    getRotation(): number {
        return this.getGameObject()?.angle || 0;
    }

    setRotation(degrees: number): void {
        this.getGameObject()?.setAngle(degrees);
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

    setLocationInView(location: Phaser.Types.Math.Vector2Like): void {
        throw new Error('Bullet.setLocationInView(...) is not supported');
    }

    getLocation(): Phaser.Math.Vector2 {
        const go = this.getGameObject();
        return Helpers.vector2(go?.x ?? 0, go?.y ?? 0);
    }

    setLocation(location: Phaser.Math.Vector2): void {
        const go: Phaser.GameObjects.Container = this.getGameObject();
        go?.setPosition(location.x, location.y);
    }

    getRange(): number {
        return this.force * (this.timeout / 1000);
    }

    destroy() {
        this.getGameObject()?.setActive(false);
        this.getGameObject()?.destroy();
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

    private _createGameObj(): void {
        const ball = this.scene.add.sprite(0, 0, 'bullet');
        let glow: Phaser.GameObjects.Sprite;
        Helpers.trycatch(() => {
            glow = this.scene.add.sprite(0, 0, 'flares', Constants.UI.SpriteMaps.Flares.green);
        }, 'bullet glow texture not loaded', 'info', false);
        glow?.setScale(this.scale);
        const maxScale = this.scale + 0.1;
        this.scene.add.tween({
            targets: glow,
            scale: maxScale,
            angle: 359,
            yoyo: true,
            duration: 250
        });
        this._gameObj = this.scene.add.container(0, 0, [ball, glow]);
        this._gameObj.setSize(ball.displayWidth, ball.displayHeight);
        this._gameObj.setDepth(Constants.UI.Layers.PLAYER);
        this.setLocation(this._startLoc);
        this.scene.physics.add.existing(this._gameObj);

        this.getPhysicsBody().setMass(this.mass);
        this.getPhysicsBody().setCircle(ball.displayWidth / 2);

        try {
            this._hitSound = this.scene.sound.add('bullet-hit');
        } catch (e) {
            // ignore
        }
    }
}