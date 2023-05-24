import { BaseScene } from "../../scenes/base-scene";
import { ShipSupply, ShipSupplyOptions } from "./ship-supply";
import { Ship } from "../ship";

export class AmmoSupply extends ShipSupply {
    constructor(scene: BaseScene, options: Omit<ShipSupplyOptions, 'supplyType'>) {
        super(scene, {...options, supplyType: 'ammo'});
    }

    override apply(ship: Ship): void {
        if (ship) {
            const oa = ship.weapon;
            oa?.addAmmo(this.amount);
        }
        this.destroy();
    }
}