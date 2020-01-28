import { RNG } from "../utilities/rng";
import "phaser";
import { ShipPodConfig } from "./ship-pod-config";
import { Updatable } from "../interfaces/updatable";
import { CanTarget } from "../interfaces/can-target";
import { CanThrust } from "../interfaces/can-thrust";
import { HasLocation } from "../interfaces/has-location";
import { Mouse } from "../utilities/mouse";
import { HasGameObject } from "../interfaces/has-game-object";

export class ShipPod implements Updatable, CanTarget, CanThrust, HasLocation, HasGameObject {
    private id: string; // UUID
    private config: ShipPodConfig;
    private gameObj: Phaser.Physics.Arcade.Sprite;
    private target: HasLocation;
    private inputKeys: Phaser.Types.Input.Keyboard.CursorKeys;

    active: boolean = true;
    
    fuelCapacity: number = 100;
    remainingFuel: number = 100;
    
    thrusterForce: number = 1; // KiloNewtons
    thrusterFuelConsumption: number = 0.01;
    thrusterHeatGeneration: number = 0.5;

    rotationRate: number = 0.2; // degrees per second
    integrity: number = 100; // maximum of 100
    temperature: number = 0; // in Celcius

    constructor(config: ShipPodConfig) {
        this.config = config;
        this.id = RNG.guid();

        this.gameObj = this.config.scene.physics.add.sprite(this.config.scene.game.scale.width / 2, this.config.scene.game.scale.height / 2, 'ship-pod');
        this.setTarget(new Mouse(this.config.scene));
        this.inputKeys = this.config.scene.input.keyboard.createCursorKeys();
    }

    update(): void {
        this.lookAtTarget();
        if (this.inputKeys.space.isDown) {
            this.thrustFowards();
        }
        this.applyCooling();
        this.integrityCheck();
    }

    /**
     * TODO: needed so we can use Floating Origin
     */
    getRealPosition(): Phaser.Math.Vector2 {
        return new Phaser.Math.Vector2(this.gameObj.x, this.gameObj.y);
    }

    /**
     * the location within the viewable area
     * @returns a {Phaser.Math.Vector2} offset for location within current 
     * viewable area
     */
    getPosition(): Phaser.Math.Vector2 {
        let cameraPos: Phaser.Math.Vector2 = this.config.scene.cameras.main.getWorldPoint(0, 0);
        return new Phaser.Math.Vector2(this.gameObj.x - cameraPos.x, this.gameObj.y - cameraPos.y);
    }

    getId(): string {
        return this.id;
    }

    getGameObject(): Phaser.GameObjects.GameObject {
        return this.gameObj;
    }

    setTarget(target: HasLocation) {
        this.target = target;
    }

    lookAtTarget(): void {
        let pos = this.target.getRealPosition();
        let radians: number = Phaser.Math.Angle.Between(pos.x, pos.y, this.gameObj.x, this.gameObj.y);
        this.gameObj.setRotation(radians);
    }

    thrustFowards(): void {
        if (this.remainingFuel > 0) {
            let delta: Phaser.Math.Vector2 = new Phaser.Math.Vector2(Math.cos(Phaser.Math.Angle.CounterClockwise(this.gameObj.rotation)), Math.sin(Phaser.Math.Angle.CounterClockwise(this.gameObj.rotation)));
            // let delta: Phaser.Math.Vector2 = mousePosition.clone().subtract(new Phaser.Math.Vector2(this.gameObj.x, this.gameObj.y));
            let normalisedDelta: Phaser.Math.Vector2 = delta.clone().normalize();
            let force: Phaser.Math.Vector2 = normalisedDelta.clone().multiply(new Phaser.Math.Vector2(this.thrusterForce, this.thrusterForce));
            let v = this.gameObj.body.velocity;
            let velocity = v.add(force);
            this.gameObj.setVelocity(velocity.x, velocity.y);

            this.remainingFuel -= this.thrusterFuelConsumption;
            this.applyHeating(this.thrusterHeatGeneration);
        }
    }

    strafeLeft(): void {

    }

    strafeRight(): void {

    }

    thrustBackwards(): void {

    }

    applyHeating(degrees: number): void {
        this.temperature += degrees;
        if (this.temperature > 100) {
            // reduce integrity based on degrees over 100
            let delta: number = this.temperature - 100;
            this.integrity -= delta;
        }
    }

    applyCooling(): void {
        if (this.temperature > 0) {
            this.temperature -= 0.1;
        }
        if (this.temperature < 0) {
            this.temperature = 0;
        }
    }

    integrityCheck(): void {
        if (this.integrity <= 0) {
            this.active = false;
            // TODO: destroy ship and end game
        }
    }
}