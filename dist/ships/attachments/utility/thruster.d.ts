import { CanThrust } from "../../../interfaces/can-thrust";
import { ShipPod } from "../../ship-pod";
export declare class Thruster implements CanThrust {
    private ship;
    private scene;
    private flareParticles;
    constructor(ship: ShipPod, scene: Phaser.Scene);
    thrustFowards(): void;
    private lastBoostTime;
    boostForwards(): void;
    strafeLeft(): void;
    strafeRight(): void;
    thrustBackwards(): void;
    private applyThrust;
    private displayThrusterFire;
}
