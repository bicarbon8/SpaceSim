import { FuelSupply, ShipSupplyOptions } from "space-sim-shared";

export class PlayerFuelSupply extends FuelSupply {
    constructor(scene: Phaser.Scene, options: ShipSupplyOptions) {
        super(scene, options);

        const sprite = this.scene.make.sprite({
            key: 'fuel-canister',
            origin: 0.5
        }, false);
        this.add(sprite);
    }
}