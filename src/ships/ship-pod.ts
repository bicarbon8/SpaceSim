import { RNG } from "../utilities/rng";
import { Vector, Bodies, Body } from "matter-js";
import { SpaceSim } from "../space-sim";

export class ShipPod {
    private id: string; // UUID

    obj: Body = Bodies.polygon(200, 200, 6, 25, {
        density: 1,
        frictionAir: 0.001
    });
    
    fuelCapacity: number = 100;
    remainingFuel: number = 100;
    
    thrust: number = 1; // KiloNewtons
    thrusterFuelConsumption: number = 0.01;
    thrusterHeatGeneration: number = 0.5;

    rotationRate: number = 0.2; // degrees per second
    integrity: number = 100; // maximum of 100
    temperature: number = 0; // in Celcius

    realPosition: Vector; // needed so we can use Floating Origin

    constructor() {
        this.id = RNG.guid();
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
            let delta: Vector = Vector.sub(SpaceSim.mouse.position, this.obj.position);
            let normalisedDelta: Vector = Vector.normalise(delta);
            let force: Vector = Vector.mult(normalisedDelta, this.thrust);
            Body.applyForce(this.obj, this.obj.position, force);

            this.remainingFuel -= this.thrusterFuelConsumption;
        }
        return this;
    }
}