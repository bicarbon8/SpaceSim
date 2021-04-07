import { GameObjects, Scene } from "phaser";
import { RNG } from "../utilities/rng";
import { Updatable } from "../interfaces/updatable";
import { CanTarget } from "../interfaces/can-target";
import { HasLocation } from "../interfaces/has-location";
import { HasGameObject } from "../interfaces/has-game-object";
import { HasIntegrity } from "../interfaces/has-integrity";
import { Constants } from "../utilities/constants";
import { Helpers } from "../utilities/helpers";
import { HasTemperature } from "../interfaces/has-temperature";
import { HasFuel } from "../interfaces/has-fuel";
import { HasPhysicsGameObject } from "../interfaces/has-physics-game-object";
import { AttachmentManager } from "./attachments/attachment-manager";
import { ThrusterAttachment } from "./attachments/utility/thruster-attachment";
import { ShipPodConfig } from "./ship-pod-config";
import { AttachmentLocation } from "./attachments/attachment-location";

export class ShipPod implements Updatable, CanTarget, HasLocation, HasGameObject<GameObjects.Container>, HasPhysicsGameObject, HasIntegrity, HasTemperature, HasFuel {
    private _id: string; // UUID
    private _currentScene: Scene;
    private _target: HasLocation;
    private _integrity: number;
    private _remainingFuel: number;
    private _temperature: number; // in Celcius
    private _flareParticles: GameObjects.Particles.ParticleEmitterManager;
    private _explosionParticles: GameObjects.Particles.ParticleEmitterManager;

    active: boolean = true;
    attachments: AttachmentManager;
    containerGameObj: GameObjects.Container;
    
    constructor(scene: Scene, config?: ShipPodConfig) {
        this._id = config?.id || RNG.guid();
        this._currentScene = scene;
        this._target = config?.target;
        this._integrity = config?.integrity || Constants.MAX_INTEGRITY;
        this._remainingFuel = config?.remainingFuel || Constants.MAX_FUEL;
        this._temperature = config?.temperature || 0;

        // create container
        this.containerGameObj = new GameObjects.Container(this._currentScene, config.location.x, config.location.y);
        this._flareParticles = new GameObjects.Particles.ParticleEmitterManager(this._currentScene, 'flares');
        this._explosionParticles = new GameObjects.Particles.ParticleEmitterManager(this._currentScene, 'explosion');
        
        // create ship-pod sprite and add to container
        let ship: GameObjects.Sprite = new GameObjects.Sprite(this._currentScene, 0, 0, 'ship-pod');
        this.getGameObject().add(ship);

        // setup physics for container
        this._currentScene.physics.add.existing(this.getGameObject());
        this.getPhysicsBody().bounce.setTo(0.7, 0.7);
        this.getPhysicsBody().setMaxVelocity(Constants.MAX_VELOCITY, Constants.MAX_VELOCITY);
        
        this.attachments = new AttachmentManager(this, this._currentScene.game);

        this._currentScene.children.add(this.getGameObject());
    }

    getThruster(): ThrusterAttachment {
        return this.attachments.getAttachment<ThrusterAttachment>(AttachmentLocation.back);
    }

    update(): void {
        if (this.active) {
            this.lookAtTarget();
            this._checkOverheatCondition();
            this.attachments.update();
        }
    }

    /**
     * checks for and applies damage based on degrees over safe temperature at a rate
     * defined by {Constants.OVERHEAT_CHECK_INTERVAL} milliseconds between each check.
     * also applies cooling at a rate of {Constants.COOLING_RATE}
     */
    private _checkOverheatCondition(): void {
        if (this.active) {
            if (this._currentScene.game.getTime() > this._lastOverheatCheck + Constants.OVERHEAT_CHECK_INTERVAL) {
                if (this._temperature > Constants.MAX_TEMPERATURE) {
                    this.destroy(); // we are dead
                }
                if (this._temperature > Constants.MAX_SAFE_TEMPERATURE) {
                    // reduce integrity based on degrees over safe operating temp
                    let delta: number = (this._temperature - Constants.MAX_SAFE_TEMPERATURE) / Constants.MAX_SAFE_TEMPERATURE;
                    this.sustainDamage(delta);
                }
                this.applyCooling(Constants.COOLING_RATE);
                this._lastOverheatCheck = this._currentScene.game.getTime();
            }
        }
    }
    private _lastOverheatCheck: number = 0;

    /**
     * TODO: needed so we can use Floating Origin
     */
    getRealLocation(): Phaser.Math.Vector2 {
        let go: GameObjects.Container = this.getGameObject();
        if (go) {
            return new Phaser.Math.Vector2(go.x, go.y);
        }
        return Phaser.Math.Vector2.ZERO;
    }

    /**
     * the location within the viewable area
     * @returns a {Phaser.Math.Vector2} offset for location within current 
     * viewable area
     */
    getLocation(): Phaser.Math.Vector2 {
        let cameraPos: Phaser.Math.Vector2 = this._currentScene.cameras.main.getWorldPoint(0, 0);
        let realLoc: Phaser.Math.Vector2 = this.getRealLocation();
        return new Phaser.Math.Vector2(realLoc.x - cameraPos.x, realLoc.y - cameraPos.y);
    }

    getId(): string {
        return this._id;
    }

    getGameObject(): GameObjects.Container {
        return this.containerGameObj;
    }

    getPhysicsBody(): Phaser.Physics.Arcade.Body {
        return this.getGameObject()?.body as Phaser.Physics.Arcade.Body;
    }

    setTarget(target: HasLocation) {
        this._target = target;
    }

    getTarget(): HasLocation {
        return this._target;
    }

    lookAtTarget(): void {
        if (this.getPhysicsBody()) {
            if (this.getTarget()) {
                let targetPos = this.getTarget().getRealLocation();
                let shipPos = this.getRealLocation();
                let radians: number = Phaser.Math.Angle.Between(targetPos.x, targetPos.y, shipPos.x, shipPos.y);
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
        this.containerGameObj = null;
        // TODO: signal end of game and display menu
    }

    private _displayShipExplosion(): void {
        let pos: Phaser.Math.Vector2 = this.getRealLocation();
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