import { ShipLike } from "../../interfaces/ship-like";
import { ShipSupply, ShipSupplyOptions } from "./ship-supply";

export class FuelSupply extends ShipSupply {
    constructor(scene: Phaser.Scene, options: Omit<ShipSupplyOptions, 'supplyType'>) {
        super(scene, {...options, supplyType: 'fuel'});
    }

    override apply(ship: ShipLike): void {
        if (ship) {
            ship.addFuel(this.amount);
        }
        this.destroy();
    }
    
    protected _createChildren(): this {
        const sprite = this.scene.make.sprite({
            key: 'fuel-canister',
            origin: 0.5
        }, false);
        this.add(sprite);
        
        return this;
    }
}