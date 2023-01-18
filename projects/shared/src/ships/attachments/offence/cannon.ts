import { BaseScene } from "../../../scenes/base-scene";
import { Weapon } from "./weapon";

export class Cannon extends Weapon {
    constructor(scene: BaseScene) {
        super(scene, {
            maxAmmo: 250,
            firingDelay: 1000,
            heatPerShot: 1,
            force: 600,
            damagePerHit: 40,
            bulletRadius: 10,
            bulletMass: 1
        });
    }
}