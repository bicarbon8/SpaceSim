import { BaseScene, GameLevel, GameLevelOptions, SpaceSim } from "space-sim-shared";
import { environment } from "../../../../environments/environment";
import { SpaceSimClient } from "../space-sim-client";

export class ClientGameLevel extends GameLevel {
    private _pathGraphics: Phaser.GameObjects.Graphics;

    static preload(scene: Phaser.Scene): void {
        scene.load.image('metaltiles', `${environment.baseUrl}/assets/tiles/metaltiles_lg.png`);
        scene.load.image('minimaptile', `${environment.baseUrl}/assets/tiles/minimap-tile.png`);
    }

    constructor(scene: BaseScene, options: Partial<GameLevelOptions>) {
        super(scene, options);

        this.wallsLayer.setDepth(SpaceSimClient.Constants.UI.Layers.PLAYER);
        if (SpaceSim.debug) {
            const graphics = this.scene.add.graphics({ lineStyle: { width: 2, color: 0x00ff00 }, fillStyle: { color: 0xffff00, alpha: 0.25 } });
            this.wallsLayer.renderDebug(graphics);
        }
    }

    override findPathTo(start: Phaser.Types.Math.Vector2Like, end: Phaser.Types.Math.Vector2Like): Array<Phaser.Types.Math.Vector2Like> {
        const path = super.findPathTo(start, end);
        if (SpaceSim.debug) {
            if (this._pathGraphics) {
                this._pathGraphics.clear();
            } else {
                this._pathGraphics = this.scene.add.graphics({ lineStyle: { width: 2, color: 0xff0000 }, fillStyle: { color: 0x00ff00, alpha: 1 } });
            }
            for (let i=0; i<path.length - 1; i++) {
                const start = path[i];
                const end = path[i + 1];
                const line = new Phaser.Geom.Line(start.x, start.y, end.x, end.y);
                this._pathGraphics.strokeLineShape(line);
                this._pathGraphics.fillCircle(start.x, start.y, 2);
            }
        }
        return path;
    }
}