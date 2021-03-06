import { GameObjects, Scene } from "phaser";
import { Updatable } from "../interfaces/updatable";
import { CanTarget } from "../interfaces/can-target";
import { HasLocation } from "../interfaces/has-location";
import { HasGameObject } from "../interfaces/has-game-object";
import { HasIntegrity } from "../interfaces/has-integrity";
import { Constants } from "../utilities/constants";
import { Helpers } from "../utilities/helpers";
import { HasTemperature } from "../interfaces/has-temperature";
import { HasFuel } from "../interfaces/has-fuel";
import { AttachmentManager } from "./attachments/attachment-manager";
import { ThrusterAttachment } from "./attachments/utility/thruster-attachment";
import { ShipPodOptions } from "./ship-pod-options";
import { AttachmentLocation } from "./attachments/attachment-location";

export class ShipPod implements Updatable, CanTarget, HasLocation, HasGameObject<GameObjects.Container>, HasIntegrity, HasTemperature, HasFuel {
    readonly id: string; // UUID
    private _scene: Scene;
    private _target: HasLocation;
    private _integrity: number;
    private _remainingFuel: number;
    private _temperature: number; // in Celcius
    private _attachmentMgr: AttachmentManager;
    private _flareParticles: GameObjects.Particles.ParticleEmitterManager;
    private _explosionParticles: GameObjects.Particles.ParticleEmitterManager;
    private _containerGameObj: GameObjects.Container;

    active: boolean = true;
    
    constructor(scene: Scene, config?: ShipPodOptions) {
        this.id = config?.id || Phaser.Math.RND.uuid();
        this._scene = scene;
        this._target = config?.target;
        this._integrity = config?.integrity || Constants.MAX_INTEGRITY;
        this._remainingFuel = config?.remainingFuel || Constants.MAX_FUEL;
        this._temperature = config?.temperature || 0;

        // create ship-pod sprite and add to container
        this._createGameObj(config);
        
        this._attachmentMgr = new AttachmentManager(this, this._scene.game);
    }

    get attachments(): AttachmentManager {
        return this._attachmentMgr;
    }

    getThruster(): ThrusterAttachment {
        return this.attachments.getAttachmentAt<ThrusterAttachment>(AttachmentLocation.back);
    }

    update(time: number, delta: number): void {
        if (this.active) {
            this.lookAt(this._target?.getLocation());
            this._checkOverheatCondition(time, delta);
            this.attachments.update(time, delta);
        }
    }

    /**
     * checks for and applies damage based on degrees over safe temperature at a rate
     * defined by {Constants.OVERHEAT_CHECK_INTERVAL} milliseconds between each check.
     * also applies cooling at a rate of {Constants.COOLING_RATE}
     */
    private _checkOverheatCondition(time: number, delta: number): void {
        if (this.active) {
            if (this._temperature > Constants.MAX_TEMPERATURE) {
                this.destroy(); // we are dead
            }
            if (this._temperature > Constants.MAX_SAFE_TEMPERATURE) {
                // reduce integrity based on degrees over safe operating temp
                let damage: number = (this._temperature - Constants.MAX_SAFE_TEMPERATURE / delta);
                this.sustainDamage(damage);
            }
            let amountCooled: number = Constants.COOLING_RATE / delta;
            this.applyCooling(amountCooled);
        }
    }

    /**
     * the location within coordinate space
     * @returns a {Phaser.Math.Vector2} for the location of this
     * {ShipPod} in coordinate space. this is different from the
     * location on screen
     */
    getLocation(): Phaser.Math.Vector2 {
        let go: Phaser.GameObjects.Container = this.getGameObject();
        if (go) {
            return new Phaser.Math.Vector2(go.x, go.y);
        }
        return Phaser.Math.Vector2.ZERO;
    }

    setLocation(location: Phaser.Math.Vector2): void {
        let go: Phaser.GameObjects.Container = this.getGameObject();
        go.x = location.x;
        go.y = location.y;
    }

    /**
     * the location within the viewable area
     * @returns a {Phaser.Math.Vector2} offset for location within current 
     * viewable area. for the Player, this should always return 0,0 since the
     * camera follows the Player
     */
    getLocationInView(): Phaser.Math.Vector2 {
        return Helpers.convertLocToLocInView(this.getLocation(), this._scene);
    }

    getGameObject(): GameObjects.Container {
        return this._containerGameObj;
    }

    getPhysicsBody(): Phaser.Physics.Arcade.Body {
        return this.getGameObject()?.body as Phaser.Physics.Arcade.Body;
    }

    setTarget<T extends HasLocation>(target: T): void {
        this._target = target;
    }

    getTarget<T extends HasLocation>(): T {
        return this._target as T;
    }

    lookAt(location: Phaser.Math.Vector2): void {
        if (this.getPhysicsBody()) {
            if (location) {
                let shipPos = this.getLocation();
                let radians: number = Phaser.Math.Angle.Between(location.x, location.y, shipPos.x, shipPos.y);
                let degrees: number = Phaser.Math.RadToDeg(radians);
                this.getPhysicsBody().rotation = degrees;
            }
        }
    }

    /**
     * the rotation of the Ship's {GameObject.body} in degrees
     */
    getRotation(): number {
        return this.getGameObject()?.angle || 0;
    }

    setRotation(angle: number): void {
        this.getGameObject()?.setAngle(angle);
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

    getTemperature(): number {
        return this._temperature;
    }

    applyHeating(degrees: number): void {
        this._temperature += degrees;
    }

    applyCooling(degrees: number): void {
        this._temperature -= degrees;
        if (this._temperature < 0) {
            this._temperature = 0;
        }
    }

    reduceFuel(amount: number): void {
        this._remainingFuel -= amount;
        if (this._remainingFuel < 0) {
            this._remainingFuel = 0;
        }
    }

    addFuel(amount: number): void {
        this._remainingFuel += amount;
        if (this._remainingFuel > Constants.MAX_FUEL) {
            this._remainingFuel = Constants.MAX_FUEL;
        }
    }

    getRemainingFuel(): number {
        return this._remainingFuel;
    }

    getIntegrity(): number {
        return this._integrity;
    }

    sustainDamage(amount: number): void {
        this._integrity -= amount;
        if (this._integrity <= 0) {
            this._integrity = 0;
            this.destroy(); // we are dead
            // TODO: return to menu scene
        }
    }

    repair(amount: number): void {
        this._integrity = amount;
        if (this._integrity > Constants.MAX_INTEGRITY) {
            this._integrity = Constants.MAX_INTEGRITY;
        }
    }

    destroy(): void {
        this.active = false;
        this._displayShipExplosion();
        this.getGameObject().destroy();
        this._containerGameObj = null;
        // TODO: signal end of game and display menu
    }

    private _createGameObj(config?: ShipPodOptions): void {
        // create container
        let loc: Phaser.Math.Vector2 = config?.location || Helpers.vector2();
        this._containerGameObj = this._scene.add.container(loc.x, loc.y);
        this._flareParticles = this._scene.add.particles('flares');
        this._explosionParticles = this._scene.add.particles('explosion');

        let ship: GameObjects.Sprite = this._scene.add.sprite(0, 0, 'ship-pod');
        this._containerGameObj.add(ship);

        // setup physics for container
        this._scene.physics.add.existing(this._containerGameObj);
        this.getPhysicsBody().bounce.setTo(0.7, 0.7);
        this.getPhysicsBody().setMaxVelocity(Constants.MAX_VELOCITY, Constants.MAX_VELOCITY);
    }

    private _displayShipExplosion(): void {
        let pos: Phaser.Math.Vector2 = this.getLocation();
        this._explosionParticles.createEmitter({
            x: pos.x,
            y: pos.y,
            lifespan: { min: 500, max: 1000 },
            speedX: { min: -1, max: 1 },
            speedY: { min: -1, max: 1 },
            angle: { min: -180, max: 179 },
            gravityX: 0,
            gravityY: 0,
            scale: { start: 1, end: 0 },
            blendMode: 'ADD',
            maxParticles: 3
        });
        this._flareParticles.createEmitter({
            frame: Constants.Flare.red as number,
            x: pos.x,
            y: pos.y,
            lifespan: { min: 100, max: 500 },
            speedX: { min: -600, max: 600 },
            speedY: { min: -600, max: 600 },
            angle: { min: -180, max: 179 },
            gravityX: 0,
            gravityY: 0,
            scale: { start: 1, end: 0 },
            blendMode: 'ADD',
            maxParticles: 10
        });
    }
}