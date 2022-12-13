import { ShipLike } from "../../interfaces/ship-like";
import { ShipSupply } from "./ship-supply";

export class CoolantSupply extends ShipSupply {
    override apply(ship: ShipLike): void {
        if (ship) {
            ship.applyCooling(this.amount);
        }
        this.destroy();
    }
    
    protected _createChildren(): this {
        const sprite = this.scene.make.sprite({
            key: 'coolant-canister',
            origin: 0.5
        }, false);
        this.add(sprite);
        
        return this;
    }
}