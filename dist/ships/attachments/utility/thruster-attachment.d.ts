import { CanThrust } from "../../../interfaces/can-thrust";
import { ShipPod } from "../../ship-pod";
import { ShipAttachment } from "../ship-attachment";
export declare class ThrusterAttachment extends ShipAttachment implements CanThrust {
    ship: ShipPod;
    scene: Phaser.Scene;
    private flareParticles;
    constructor(scene: Phaser.Scene);
    update(): void;
    trigger(): void;
    thrustFowards(): void;
    private lastBoostTime;
    boostForwards(): void;
    strafeLeft(): void;
    strafeRight(): void;
    thrustBackwards(): void;
    private applyThrust;
    private displayThrusterFire;
}
