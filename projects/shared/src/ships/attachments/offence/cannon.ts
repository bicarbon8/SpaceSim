import { Ship } from "../../ship";
import { Weapons, WeaponsOptions } from "./weapons";

export class Cannon extends Weapons {
    constructor(ship: Ship, options: Pick<WeaponsOptions, 'exploder' | 'bulletFactory'>) {
        super(ship, {
            maxAmmo: 250,
            firingDelay: 1000,
            heatPerShot: 1,
            force: 600,
            damagePerHit: 40,
            bulletRadius: 10,
            bulletMass: 1,
            ...options
        });
    }
}