import { Ship } from "../../ship";
import { OffenceAttachment } from "./offence-attachment";

export class MachineGunAttachment extends OffenceAttachment {
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