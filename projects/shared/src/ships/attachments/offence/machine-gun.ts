import { Ship } from "../../ship";
import { Weapons, WeaponsOptions } from "./weapons";

export class MachineGun extends Weapons {
    constructor(ship: Ship, options: Pick<WeaponsOptions, 'exploder' | 'bulletFactory'>) {
        super(ship, {
            maxAmmo: 500,
            firingDelay: 200,
            heatPerShot: 1,
            force: 1000,
            damagePerHit: 10,
            bulletMass: 0.01,
            bulletRadius: 5,
            ...options
        });
    }
}