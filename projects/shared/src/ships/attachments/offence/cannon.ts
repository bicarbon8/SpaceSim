import { BaseScene } from "../../../scenes/base-scene";
import { Weapon } from "./weapon";

export class Cannon extends Weapon {
    constructor(scene: BaseScene) {
        super(scene, {
            model: 'cannon',
            maxAmmo: 100,
            firingDelay: 1000,
            heatPerShot: 1,
            force: 500,
            damagePerHit: 40,
            heatPerHit: 0.1,
            bulletRadius: 10,
            bulletMass: 1,
            bulletTimeout: 2000
        });
    }
}