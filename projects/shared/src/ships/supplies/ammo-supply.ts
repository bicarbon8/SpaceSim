import { BaseScene } from "../../scenes/base-scene";
import { ShipLike } from "../../interfaces/ship-like";
import { ShipSupply, ShipSupplyOptions } from "./ship-supply";

export class AmmoSupply extends ShipSupply {
    constructor(scene: BaseScene, options: Omit<ShipSupplyOptions, 'supplyType'>) {
        super(scene, {...options, supplyType: 'ammo'});
    }

    override apply(ship: ShipLike): void {
        if (ship) {
            const oa = ship.getWeapons();
            oa?.addAmmo(this.amount);
        }
        this.destroy();
    }
}