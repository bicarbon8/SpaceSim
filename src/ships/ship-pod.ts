import { RNG } from "../utilities/rng";
import "phaser";
import { Updatable } from "../interfaces/updatable";
import { CanTarget } from "../interfaces/can-target";
import { CanThrust } from "../interfaces/can-thrust";
import { HasLocation } from "../interfaces/has-location";
import { Mouse } from "../utilities/mouse";
import { HasGameObject } from "../interfaces/has-game-object";
import { Globals } from "../utilities/globals";

export class ShipPod implements Updatable, CanTarget, CanThrust, HasLocation, HasGameObject {
    private id: string; // UUID
    private scene: Phaser.Scene;
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

    constructor(scene: Phaser.Scene) {
        this.id = RNG.guid();
        this.scene = scene;
        this.gameObj = scene.physics.add.sprite(0, 0, 'ship-pod');
        this.inputKeys = scene.input.keyboard.createCursorKeys();

        this.setTarget(Globals.mouse);
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
        let cameraPos: Phaser.Math.Vector2 = this.scene.cameras.main.getWorldPoint(0, 0);
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

    getHeading(): Phaser.Math.Vector2 {
        let x: number = Math.cos(this.gameObj.rotation);
        let y: number = Math.sin(this.gameObj.rotation);
        return new Phaser.Math.Vector2(x, y).normalize().negate();
    }

    thrustFowards(): void {
        if (this.remainingFuel > 0) {
            let heading: Phaser.Math.Vector2 = this.getHeading();
            let deltaV: Phaser.Math.Vector2 = heading.multiply(new Phaser.Math.Vector2(this.thrusterForce, this.thrusterForce));
            this.gameObj.body.velocity.add(deltaV);

            this.reduceFuel(this.thrusterFuelConsumption);
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

    reduceFuel(amount: number): void {
        this.remainingFuel -= amount;
        if (this.remainingFuel < 0) {
            this.remainingFuel = 0;
        }
    }

    integrityCheck(): void {
        if (this.integrity <= 0) {
            this.active = false;
            // TODO: destroy ship and end game
        }
    }
}