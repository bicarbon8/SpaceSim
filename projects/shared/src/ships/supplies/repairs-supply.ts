import { ShipLike } from "../../interfaces/ship-like";
import { ShipSupply, ShipSupplyOptions } from "./ship-supply";

export class RepairsSupply extends ShipSupply {
    constructor(scene: Phaser.Scene, options: Omit<ShipSupplyOptions, 'supplyType'>) {
        super(scene, {...options, supplyType: 'repairs'});
    }

    override apply(ship: ShipLike): void {
        if (ship) {
            ship.repair(this.amount);
        }
        this.destroy();
    }
}