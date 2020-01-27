import { RNG } from "../utilities/rng";
import "phaser";
import { ShipPodConfig } from "./ship-pod-config";
import { Globals } from "../utilities/globals";

export class ShipPod {
    private id: string; // UUID
    private config: ShipPodConfig;
    private gameObj: Phaser.Physics.Arcade.Sprite;

    active: boolean = true;
    
    fuelCapacity: number = 100;
    remainingFuel: number = 100;
    
    thrusterForce: number = 1; // KiloNewtons
    thrusterFuelConsumption: number = 0.01;
    thrusterHeatGeneration: number = 0.5;

    rotationRate: number = 0.2; // degrees per second
    integrity: number = 100; // maximum of 100
    temperature: number = 0; // in Celcius

    realPosition: Phaser.Math.Vector2 = Phaser.Math.Vector2.ZERO; // needed so we can use Floating Origin

    constructor(config: ShipPodConfig) {
        this.config = config;
        this.id = RNG.guid();

        this.gameObj = this.config.scene.physics.add.sprite(this.config.scene.game.scale.width / 2, this.config.scene.game.scale.height / 2, 'ship-pod');
    }

    update(): void {
        this.lookAt(Globals.mouseLocation);
        if (Globals.inputKeys.space.isDown) {
            this.activateThruster();
        }
        this.applyCooling();
        this.integrityCheck();
    }

    getId(): string {
        return this.id;
    }

    lookAt(position: Phaser.Math.Vector2): void {
        if (position) {
            let radians: number = Phaser.Math.Angle.Between(position.x, position.y, this.gameObj.x, this.gameObj.y);
            this.gameObj.setRotation(radians);
        }
    }

    activateThruster(): void {
        if (this.remainingFuel > 0) {
            let delta: Phaser.Math.Vector2 = Globals.mouseLocation.clone().subtract(new Phaser.Math.Vector2(this.gameObj.x, this.gameObj.y));
            let normalisedDelta: Phaser.Math.Vector2 = delta.clone().normalize();
            let force: Phaser.Math.Vector2 = normalisedDelta.clone().multiply(new Phaser.Math.Vector2(this.thrusterForce, this.thrusterForce));
            let v = this.gameObj.body.velocity;
            console.log(`current velocity: ${JSON.stringify(v)}`);
            let velocity = v.add(force);
            this.gameObj.setVelocity(velocity.x, velocity.y);

            this.remainingFuel -= this.thrusterFuelConsumption;
            this.applyHeating(this.thrusterHeatGeneration);
        }
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