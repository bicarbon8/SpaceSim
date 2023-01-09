import { Ship } from "../../ship";
import { Weapons } from "./weapons";

export class Cannon extends Weapons {
    constructor(ship: Ship) {
        super(ship, {
            maxAmmo: 250,
            firingDelay: 1000,
            heatPerShot: 1,
            force: 600,
            damagePerHit: 40,
            bulletScale: 1,
            bulletMass: 1
        });
    }
}