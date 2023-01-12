import { BaseScene } from "../../scenes/base-scene";
import { ShipLike } from "../../interfaces/ship-like";
import { ShipSupply, ShipSupplyOptions } from "./ship-supply";

export class CoolantSupply extends ShipSupply {
    constructor(scene: BaseScene, options: Omit<ShipSupplyOptions, 'supplyType'>) {
        super(scene, {...options, supplyType: 'coolant'});
    }
    
    override apply(ship: ShipLike): void {
        if (ship) {
            ship.applyCooling(this.amount);
        }
        this.destroy();
    }
}