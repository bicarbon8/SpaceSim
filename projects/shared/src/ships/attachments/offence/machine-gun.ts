import { BaseScene } from "../../../scenes/base-scene";
import { Weapon } from "./weapon";

export class MachineGun extends Weapon {
    constructor(scene: BaseScene) {
        super(scene, {
            maxAmmo: 500,
            firingDelay: 200,
            heatPerShot: 1,
            force: 1000,
            damagePerHit: 10,
            bulletMass: 0.1,
            bulletRadius: 5
        });
    }
}