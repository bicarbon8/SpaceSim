import { RNG } from "../utilities/rng";
import { Vector, Bodies } from "matter-js";

export class ShipPod {
    private id: string; // UUID

    obj: Bodies = Bodies.circle(0, 0, 25, {maxSides: 5} as Matter.IBodyDefinition);
    
    fuelCapacity: number;
    remainingFuel: number;
    thrust: number; // KiloNewtons
    rotationRate: number; // degrees per second
    integrity: number; // maximum of 100
    mass: number; // in Tonnes
    temperature: number; // in Celcius

    position: Vector;

    private heading: Vector; // must always be normalized
    private movement: Vector; // must always be normalized

    constructor() {
        this.id = RNG.guid();
    }

    getId(): string {
        return this.id;
    }

    activateThruster(): ShipPod {
        this.movement = Vector.normalise(Vector.add(Vector.mult(this.heading, this.thrust), this.movement));
        return this;
    }
}