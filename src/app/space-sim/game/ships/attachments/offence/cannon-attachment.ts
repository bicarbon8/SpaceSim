import { Ship } from "../../ship";
import { OffenceAttachment } from "./offence-attachment";

export class CannonAttachment extends OffenceAttachment {
    constructor(ship: Ship) {
        super(ship, {
            maxAmmo: 500,
            firingDelay: 1000,
            heatPerShot: 1,
            force: 600,
            damagePerHit: 40,
            bulletScale: 1,
            bulletMass: 1
        });
    }
}