import "phaser";
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
import { Thruster } from "./attachments/utility/thruster";
import { ShipPodConfig } from "./ship-pod-config";

export class ShipPod implements Updatable, CanTarget, HasLocation, HasGameObject<Phaser.GameObjects.Container>, HasPhysicsGameObject, HasIntegrity, HasTemperature, HasFuel {
    private id: string; // UUID
    private scene: Phaser.Scene;
    private gameObj: Phaser.GameObjects.Container;
    private target: HasLocation;
    private integrity: number;
    private remainingFuel: number = 100;
    private temperature: number = 0; // in Celcius
    private flareParticles: Phaser.GameObjects.Particles.ParticleEmitterManager;
    private explosionParticles: Phaser.GameObjects.Particles.ParticleEmitterManager;

    active: boolean = true;
    attachments: AttachmentManager;
    thruster: Thruster;
    
    constructor(scene: Phaser.Scene, config?: ShipPodConfig) {
        if (!config) {
            config = {x: 0, y: 0};
        }
        this.id = RNG.guid();
        this.scene = scene;
        this.gameObj = scene.add.container(config.x, config.y);
        this.scene.physics.add.existing(this.gameObj);
        this.getPhysicsBody().bounce.setTo(0.7, 0.7);
        this.getPhysicsBody().setMaxVelocity(Constants.MAX_VELOCITY, Constants.MAX_VELOCITY);
        this.flareParticles = scene.add.particles('flares');
        this.explosionParticles = scene.add.particles('explosion');
        let ship: Phaser.GameObjects.Sprite = scene.add.sprite(0, 0, 'ship-pod');
        this.getGameObject().add(ship);
        
        this.integrity = Constants.MAX_INTEGRITY;
        this.thruster = new Thruster(this, this.scene);
        this.attachments = new AttachmentManager(this, this.scene);
    }

    update(): void {
        if (this.active) {
            this.lookAtTarget();
            this.checkOverheatCondition();
            this.attachments.update();
        }
    }

    /**
     * checks for and applies damage based on degrees over safe temperature at a rate
     * defined by {Constants.OVERHEAT_CHECK_INTERVAL} milliseconds between each check.
     * also applies cooling at a rate of {Constants.COOLING_RATE}
     */
    private checkOverheatCondition(): void {
        if (this.active) {
            if (this.scene.game.getTime() > this.lastOverheatCheck + Constants.OVERHEAT_CHECK_INTERVAL) {
                if (this.temperature > Constants.MAX_TEMPERATURE) {
                    this.destroy(); // we are dead
                }
                if (this.temperature > Constants.MAX_SAFE_TEMPERATURE) {
                    // reduce integrity based on degrees over safe operating temp
                    let delta: number = (this.temperature - Constants.MAX_SAFE_TEMPERATURE) / Constants.MAX_SAFE_TEMPERATURE;
                    this.sustainDamage(delta);
                }
                this.applyCooling(Constants.COOLING_RATE);
                this.lastOverheatCheck = this.scene.game.getTime();
            }
        }
    }
    private lastOverheatCheck: number = 0;

    /**
     * TODO: needed so we can use Floating Origin
     */
    getRealLocation(): Phaser.Math.Vector2 {
        if (this.getGameObject()) {
            return new Phaser.Math.Vector2(this.getGameObject().x, this.getGameObject().y);
        }
        return Phaser.Math.Vector2.ZERO;
    }

    /**
     * the location within the viewable area
     * @returns a {Phaser.Math.Vector2} offset for location within current 
     * viewable area
     */
    getLocation(): Phaser.Math.Vector2 {
        if (this.getGameObject()) {
            let cameraPos: Phaser.Math.Vector2 = this.scene.cameras.main.getWorldPoint(0, 0);
            return new Phaser.Math.Vector2(this.gameObj.x - cameraPos.x, this.gameObj.y - cameraPos.y);
        }
        return Phaser.Math.Vector2.ZERO;
    }

    getId(): string {
        return this.id;
    }

    getGameObject(): Phaser.GameObjects.Container {
        return this.gameObj;
    }

    getPhysicsBody(): Phaser.Physics.Arcade.Body {
        if (this.getGameObject()) {
            return this.getGameObject().body as Phaser.Physics.Arcade.Body;
        }
        return null;
    }

    setTarget(target: HasLocation) {
        this.target = target;
    }

    getTarget(): HasLocation {
        return this.target;
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
        if (this.getGameObject()) {
            return this.getGameObject().angle;
        }
        return 0;
    }

    getHeading(): Phaser.Math.Vector2 {
        return Helpers.getHeading(this.getRotation());
    }

    getSpeed(): number {
        return this.getVelocity().length();
    }

    getVelocity(): Phaser.Math.Vector2 {
        if (this.getPhysicsBody()) {
            return this.getPhysicsBody().velocity.clone();
        }
        return Phaser.Math.Vector2.ZERO;
    }

    getTemperature(): number {
        return this.temperature;
    }

    applyHeating(degrees: number): void {
        this.temperature += degrees;
    }

    applyCooling(degrees: number): void {
        this.temperature -= degrees;
        if (this.temperature < 0) {
            this.temperature = 0;
        }
    }

    reduceFuel(amount: number): void {
        this.remainingFuel -= amount;
        if (this.remainingFuel < 0) {
            this.remainingFuel = 0;
        }
    }

    addFuel(amount: number): void {
        this.remainingFuel += amount;
        if (this.remainingFuel > Constants.MAX_FUEL) {
            this.remainingFuel = Constants.MAX_FUEL;
        }
    }

    getRemainingFuel(): number {
        return this.remainingFuel;
    }

    getIntegrity(): number {
        return this.integrity;
    }

    sustainDamage(amount: number): void {
        this.integrity -= amount;
        if (this.integrity <= 0) {
            this.integrity = 0;
            this.destroy(); // we are dead
        }
    }

    repair(amount: number): void {
        this.integrity = amount;
        if (this.integrity > Constants.MAX_INTEGRITY) {
            this.integrity = Constants.MAX_INTEGRITY;
        }
    }

    destroy(): void {
        this.active = false;
        this.displayShipExplosion();
        this.getGameObject().destroy();
        this.gameObj = null;
        // TODO: signal end of game and display menu
    }

    private displayShipExplosion(): void {
        let pos: Phaser.Math.Vector2 = this.getRealLocation();
        this.explosionParticles.createEmitter({
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
        this.flareParticles.createEmitter({
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