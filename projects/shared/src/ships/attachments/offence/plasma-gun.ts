import { BaseScene } from "../../../scenes/base-scene";
import { Weapon } from "./weapon";

export class PlasmaGun extends Weapon {
    constructor(scene: BaseScene) {
        super(scene, {
            model: 'plasma',
            maxAmmo: 5000,
            firingDelay: 10,
            heatPerShot: 0.01,
            force: 300,
            damagePerHit: 0.01,
            heatPerHit: 0.5,
            bulletRadius: 5,
            bulletMass: 0,
            bulletTimeout: 1000
        });
    }
}