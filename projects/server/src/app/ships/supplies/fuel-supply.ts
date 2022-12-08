import { ShipLike } from "src/app/interfaces/ship-like";
import { ShipSupply } from "./ship-supply";

export class FuelSupply extends ShipSupply {
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