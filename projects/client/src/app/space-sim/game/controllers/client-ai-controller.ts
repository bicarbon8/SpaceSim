import { AiController, SpaceSim } from "space-sim-shared";
import { SpaceSimClient } from "../space-sim-client";

export class ClientAiController extends AiController {
    override get view(): Phaser.Geom.Polygon {
        const view = super.view;
        if (SpaceSim.debug) {
            const graphics = this.scene.add.graphics({ 
                lineStyle: { width: 2, color: 0x00ff00 }, 
                fillStyle: { color: 0xffff00, alpha: 0.25 } 
            }).setDepth(SpaceSimClient.Constants.UI.Layers.PLAYER);
            const viewPoints = view.points;
            graphics.beginPath();
            graphics.moveTo(viewPoints[0].x, viewPoints[0].y);
            for (let i=1; i<viewPoints.length; i++) {
                graphics.lineTo(viewPoints[i].x, viewPoints[i].y);
            }
            graphics.closePath();
            graphics.fillPath();

            this.scene.tweens.add({
                targets: graphics,
                alpha: 0,
                duration: SpaceSim.Constants.Timing.LOW_PRI_UPDATE_FREQ,
                onComplete: () => {
                    graphics.destroy();
                }
            });
        }
        return view;
    }
}