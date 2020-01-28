import { ShipPod } from "./ships/ship-pod";
import { ShipPodConfig } from "./ships/ship-pod-config";
import { Globals } from "./utilities/globals";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: true,
    visible: true,
    key: 'GameScene'
};

export class GameScene extends Phaser.Scene {
    constructor() {
        super(sceneConfig);
    }

    public preload(): void {
        
    }

    public create(): void {
        let podConfig: ShipPodConfig = {
            scene: this,
            x: 200,
            y: 200,
            texture: './assets/sprites/ship-pod.png',
            frame: 0
        };
        Globals.player = new ShipPod(podConfig);

        this.followPlayer();
        
        this.input.on('KEY_DOWN_P', (event) => {
            Globals.isPaused = true;
        });
        this.input.on('KEY_DOWN_R', () => {
            Globals.isPaused = false;
        });
    }

    public update(): void {
        if (!Globals.isPaused) {
            Globals.player.update();
        }
    }

    private followPlayer(): void {
        this.cameras.main.startFollow(Globals.player.getGameObject(), false, 0.5, 0.1);
    }
}