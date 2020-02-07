import { Globals } from "../utilities/globals";
import { ShipPod } from "../ships/ship-pod";
import { ShipAttachment } from "../ships/attachments/ship-attachment";
import { AttachmentLocation } from "../ships/attachments/attachment-location";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: true,
    visible: true,
    key: 'OverlayScene'
};

export class OverlayScene extends Phaser.Scene {
    private shipDebug: Phaser.GameObjects.Text;

    constructor() {
        super(sceneConfig);
    }

    public preload(): void {

    }

    public create(): void {
        this.shipDebug = this.add.text(10, 10, '', { font: '16px Courier', fill: '#ffdddd' });
    }

    public update(): void {
        if (Globals.debug) {
            this.displayDebugInfo();
        }
    }

    private displayDebugInfo(): void {
        if (Globals.player) {
            let p: ShipPod = Globals.player;
            let loc: Phaser.Math.Vector2 = p.getRealLocation();
            let info: string[] = [
                `Speed: ${p.getSpeed().toFixed(1)}`,
                `Integrity: ${p.getIntegrity().toFixed(1)}`,
                `Heat: ${p.getTemperature().toFixed(1)}`,
                `Fuel: ${p.getRemainingFuel().toFixed(1)}`,
                `Location: ${loc.x.toFixed(1)},${loc.y.toFixed(1)}`,
                `Angle: ${p.getRotation().toFixed(1)}`
            ];
            let attachments: ShipAttachment[] = p.attachments.getAttachments();
            for (var i=0; i<attachments.length; i++) {
                if (attachments[i]) {
                    info.push(`---- AttachmentLocation.${AttachmentLocation[i]} - ${i} ----`);
                    let attLoc: Phaser.Math.Vector2 = attachments[i].getRealLocation();
                    info.push(`-- Location: ${attLoc.x.toFixed(1)},${attLoc.y.toFixed(1)}`);
                    info.push(`-- Angle: ${attachments[i].getRotation().toFixed(1)}`);
                }
            }
            this.shipDebug.setText(info);
        }
    }
}