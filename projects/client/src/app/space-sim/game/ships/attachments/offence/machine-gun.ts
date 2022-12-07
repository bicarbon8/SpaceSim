import { Ship } from "../../ship";
import { Weapons } from "./weapons";

export class MachineGun extends Weapons {
    constructor(ship: Ship) {
        super(ship, {
            maxAmmo: 1500,
            firingDelay: 200,
            heatPerShot: 1,
            force: 1000,
            damagePerHit: 10,
            bulletMass: 0.01,
            bulletScale: 0.25
        });
    }
}