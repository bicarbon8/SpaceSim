import { AmmoSupply, ShipSupplyOptions } from "space-sim-shared";

export class PlayerAmmoSupply extends AmmoSupply {
    constructor(scene: Phaser.Scene, options: ShipSupplyOptions) {
        super(scene, options);

        const sprite = this.scene.make.sprite({
            key: 'ammo',
            origin: 0.5
        }, false);
        this.add(sprite);
    }
}