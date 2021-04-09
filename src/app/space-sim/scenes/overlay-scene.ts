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
    private _debugText: Phaser.GameObjects.Text;

    constructor(settingsConfig?: Phaser.Types.Scenes.SettingsConfig) {
        let conf: Phaser.Types.Scenes.SettingsConfig = settingsConfig || sceneConfig;
        super(conf);
    }

    public preload(): void {

    }

    public create(): void {
        this._debugText = this.add.text(10, 10, '', { font: '16px Courier', fontStyle: 'color: #ffdddd' });
    }

    public update(): void {
        if (Globals.debug) {
            this.displayDebugInfo();
        }
    }

    private displayDebugInfo(): void {
        if (Globals.player) {
            let p: ShipPod = Globals.player;
            let loc: Phaser.Math.Vector2 = p.getLocation();
            let v: Phaser.Math.Vector2 = p.getVelocity();
            let info: string[] = [
                `Speed: ${p.getSpeed().toFixed(1)}`,
                `Integrity: ${p.getIntegrity().toFixed(1)}`,
                `Heat: ${p.getTemperature().toFixed(1)}`,
                `Fuel: ${p.getRemainingFuel().toFixed(1)}`,
                `Location: ${loc.x.toFixed(1)},${loc.y.toFixed(1)}`,
                `Angle: ${p.getRotation().toFixed(1)}`,
                `Velocity: ${v.x.toFixed(1)},${v.y.toFixed(1)}`
            ];
            let attachments: ShipAttachment[] = p.attachments.getAttachments();
            for (var i=0; i<attachments.length; i++) {
                if (attachments[i]) {
                    info.push(`AttachmentLocation.${AttachmentLocation[i]} - ${i}`);
                    let attLoc: Phaser.Math.Vector2 = attachments[i].getLocation();
                    info.push(`-- Location: ${attLoc.x.toFixed(1)},${attLoc.y.toFixed(1)}`);
                    info.push(`-- Angle: ${attachments[i].getRotation().toFixed(1)}`);
                }
            }
            this._debugText.setText(info);
        }
    }
}