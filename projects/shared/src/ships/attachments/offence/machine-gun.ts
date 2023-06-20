import { BaseScene } from "../../../scenes/base-scene";
import { Weapon } from "./weapon";

export class MachineGun extends Weapon {
    constructor(scene: BaseScene) {
        super(scene, {
            model: 'machinegun',
            maxAmmo: 300,
            firingDelay: 200,
            heatPerShot: 1,
            force: 1000,
            damagePerHit: 10,
            heatPerHit: 0,
            bulletMass: 0.1,
            bulletRadius: 5,
            bulletTimeout: 500
        });
    }
}