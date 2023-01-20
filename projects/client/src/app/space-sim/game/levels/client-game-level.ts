import { BaseScene, Constants, GameLevel, GameLevelOptions, SpaceSim } from "space-sim-shared";
import { environment } from "../../../../environments/environment";

export class ClientGameLevel extends GameLevel {
    static preload(scene: Phaser.Scene): void {
        scene.load.image('metaltiles', `${environment.baseUrl}/assets/tiles/metaltiles_lg.png`);
        scene.load.image('minimaptile', `${environment.baseUrl}/assets/tiles/minimap-tile.png`);
    }

    constructor(scene: BaseScene, options: GameLevelOptions) {
        super(scene, options);

        this.primaryLayer.setDepth(Constants.UI.Layers.PLAYER);
        if (SpaceSim.debug) {
            const graphics = this.scene.add.graphics({ lineStyle: { width: 2, color: 0x00ff00 }, fillStyle: { color: 0xffff00 } });
            this.primaryLayer.renderDebug(graphics);
        }
    }
}