import { CoolantSupply, ShipSupplyOptions } from "space-sim-shared"

export class PlayerCoolantSupply extends CoolantSupply {
    constructor(scene: Phaser.Scene, options: ShipSupplyOptions) {
        super(scene, options);

        const sprite = this.scene.make.sprite({
            key: 'coolant-canister',
            origin: 0.5
        }, false);
        this.add(sprite);
    }
}