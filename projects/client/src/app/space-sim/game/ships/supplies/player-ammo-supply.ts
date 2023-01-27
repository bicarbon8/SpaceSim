import { AmmoSupply, BaseScene, ShipSupplyOptions } from "space-sim-shared";
import { environment } from "../../../../../environments/environment";
import { SpaceSimClient } from "../../space-sim-client";

export class PlayerAmmoSupply extends AmmoSupply {
    static preload(scene: Phaser.Scene): void {
        scene.load.image('ammo', `${environment.baseUrl}/assets/sprites/ammo.png`);
    }
    
    constructor(scene: BaseScene, options: ShipSupplyOptions) {
        super(scene, options);

        const sprite = this.scene.make.sprite({
            x: 0,
            y: 0,
            key: 'ammo',
            origin: 0.5
        }, false);
        this.add(sprite)
            .setDepth(SpaceSimClient.Constants.UI.Layers.PLAYER);
    }
}