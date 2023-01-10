import { AmmoSupply, ShipSupplyOptions } from "space-sim-shared";

export class PlayerAmmoSupply extends AmmoSupply {
    constructor(scene: Phaser.Scene, options: ShipSupplyOptions) {
        super(scene, options);

        const sprite = this.scene.make.sprite({
            x: 0,
            y: 0,
            key: 'ammo',
            origin: 0
        }, false);
        this.add(sprite);
    }
}