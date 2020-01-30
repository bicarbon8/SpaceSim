import { Globals } from "../utilities/globals";
import { ShipPod } from "../ships/ship-pod";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: true,
    visible: true,
    key: 'OverlayScene'
};

export class OverlayScene extends Phaser.Scene {
    private debug: Phaser.GameObjects.Text;

    constructor() {
        super(sceneConfig);
    }

    public preload(): void {

    }

    public create(): void {
        this.debug = this.add.text(10, 10, '', { font: '16px Courier', fill: '#ffdddd' });
    }

    public update(): void {
        if (!Globals.paused) {
            if (Globals.player) {
                let p: ShipPod = Globals.player;
                let loc: Phaser.Math.Vector2 = p.getRealLocation();
                this.debug.setText([
                    `Velocity: ${Math.round(p.getVelocity())}`,
                    `Integrity: ${Math.round(p.getIntegrity())}`,
                    `Heat: ${Math.round(p.getTemperature())}`,
                    `Location: ${Math.round(loc.x)},${Math.round(loc.y)}`
                ]);
            }
        }
    }
}