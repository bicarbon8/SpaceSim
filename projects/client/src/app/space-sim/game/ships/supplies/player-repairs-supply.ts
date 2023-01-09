import { RepairsSupply, ShipSupplyOptions } from "space-sim-shared";

export class PlayerRepairsSupply extends RepairsSupply {
    constructor(scene: Phaser.Scene, options: ShipSupplyOptions) {
        super(scene, options);

        const sprite = this.scene.make.sprite({
            key: 'repairs-canister',
            origin: 0.5
        }, false);
        this.add(sprite);
    }
}