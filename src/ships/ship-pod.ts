import { RNG } from "../utilities/rng";
import { Vector, Bodies, Body } from "matter-js";
import { Game } from "../game";
import { Updatable } from "../interfaces/updatable";

export class ShipPod implements Updatable {
    private id: string; // UUID

    obj: Body;
    active: boolean = true;
    
    fuelCapacity: number = 100;
    remainingFuel: number = 100;
    
    thrust: number = 1; // KiloNewtons
    thrusterFuelConsumption: number = 0.01;
    thrusterHeatGeneration: number = 0.5;

    rotationRate: number = 0.2; // degrees per second
    integrity: number = 100; // maximum of 100
    temperature: number = 0; // in Celcius

    realPosition: Vector = {x:0, y:0}; // needed so we can use Floating Origin

    constructor() {
        this.id = RNG.guid();
        this.obj = Bodies.polygon(200, 200, 6, 25, {
            density: 1,
            frictionAir: 0.001,
            render: {
                sprite: {
                    texture: './assets/sprites/ship-pod.png',
                    xScale: 1,
                    yScale: 1
                }
            }
        });
    }

    update(): void {
        if (this.active) {
            this.lookAt(Game.mouse.position);
            let keys: string[] = Game.keys;
            Game.keys = [];
            while (keys.length > 0) {
                let key: string = keys.pop();
                if (key == 'Space') {
                    this.activateThruster();
                }
            }
            this.applyCooling();
            if (this.temperature > 100) {
                // reduce integrity based on degrees over 100
                let delta: number = this.temperature - 100;
                this.integrity -= delta;
            }
        }
    }

    getId(): string {
        return this.id;
    }

    lookAt(position: Vector): ShipPod {
        let angle: number = Vector.angle(this.obj.position, position);
        Body.setAngle(this.obj, angle);
        return this;
    }

    activateThruster(): ShipPod {
        if (this.remainingFuel > 0) {
            let delta: Vector = Vector.sub(Game.mouse.position, this.obj.position);
            let normalisedDelta: Vector = Vector.normalise(delta);
            let force: Vector = Vector.mult(normalisedDelta, this.thrust);
            Body.applyForce(this.obj, this.obj.position, force);

            this.remainingFuel -= this.thrusterFuelConsumption;
            this.temperature += this.thrusterHeatGeneration;
        }
        return this;
    }

    applyCooling(): ShipPod {
        if (this.temperature > 0) {
            this.temperature -= 0.1;
        }
        if (this.temperature < 0) {
            this.temperature = 0;
        }
        return this;
    }
}