import { ShipPod } from "./ships/ship-pod";
import { ShipPodConfig } from "./ships/ship-pod-config";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: true,
    visible: true,
    key: 'GameScene'
};

export class GameScene extends Phaser.Scene {
    private player: ShipPod;
    
    isPaused: boolean = false;
    inputKeys: Phaser.Types.Input.Keyboard.CursorKeys;
    mouseLocation: Phaser.Math.Vector2;

    constructor() {
        super(sceneConfig);
    }

    public preload(): void {
        
    }

    public create(): void {
        this.inputKeys = this.input.keyboard.createCursorKeys();
        
        let podConfig: ShipPodConfig = {
            scene: this,
            x: 200,
            y: 200,
            texture: './assets/sprites/ship-pod.png',
            frame: 0
        };
        this.player = new ShipPod(podConfig);
        
        this.input.on('pointermove', (pointer) => {
            this.mouseLocation = new Phaser.Math.Vector2(pointer.x, pointer.y);
        });
        this.input.on('KEY_DOWN_P', (event) => {
            this.isPaused = true;
        });
        this.input.on('KEY_DOWN_R', () => {
            this.isPaused = false;
        });
    }

    public update(): void {
        if (!this.isPaused) {
            this.player.update();
        }
    }
}