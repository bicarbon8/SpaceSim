import { ShipPod } from "../ships/ship-pod";
import { Globals } from "../utilities/globals";
import { Mouse } from "../utilities/mouse";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: true,
    visible: true,
    key: 'GameScene'
};

export class ShipScene extends Phaser.Scene {
    constructor() {
        super(sceneConfig);
    }

    public preload(): void {
        this.load.image('stellar-forge', './assets/backgrounds/StellarForgeClouds.jpg');
        this.load.image('ship-pod', './assets/sprites/ship-pod.png');
    }

    public create(): void {
        // this.cameras.main.setBounds(0, 0, 2666, 2621);
        // this.physics.world.setBounds(0, 0, 2666, 2621);

        this.add.image(0, 0, 'stellar-forge');

        if (!Globals.mouse) {
            Globals.mouse = new Mouse(this);
        }
        Globals.player = new ShipPod(this);

        this.setupCamera();
        
        this.input.on('KEY_DOWN_P', (event) => {
            Globals.isPaused = true;
        });
        this.input.on('KEY_DOWN_R', () => {
            Globals.isPaused = false;
        });
        this.input.on('wheel', (pointer, currentlyOver, dx, dy, dz, event) => {
            let currentZoom: number = this.cameras.main.zoom;
            if (dy < 0) { // scrolled down
                // zoom in
                let newZoom: number = currentZoom + 0.5;
                if (newZoom > 1) {
                    newZoom = 1;
                }
                // console.log(`zooming from ${currentZoom} to ${newZoom}`);
                this.cameras.main.zoomTo(newZoom);
            } else if (dy > 0) { // scrolled up
                // zoom out
                let newZoom: number = currentZoom - 0.5;
                if (newZoom < 0.1) {
                    newZoom = 0.1;
                }
                // console.log(`zooming from ${currentZoom} to ${newZoom}`);
                this.cameras.main.zoomTo(newZoom);
            }
        });
    }

    public update(): void {
        if (!Globals.isPaused) {
            Globals.player.update();
        }
    }

    private setupCamera(): void {
        this.cameras.main.setZoom(1);
        this.cameras.main.centerOn(0, 0);

        let width: number = this.cameras.main.width;
        let height: number = this.cameras.main.height;
        let dzWidth: number = Math.floor(width / 2);
        let dzHeight: number = Math.floor(height / 2);
        let dzX: number = Math.floor(dzWidth / 2);
        let dzY: number = Math.floor(dzHeight / 2);
        this.cameras.main.startFollow(Globals.player.getGameObject(), true);
        this.cameras.main.deadzone = new Phaser.Geom.Rectangle(dzX, dzY, dzWidth, dzHeight);
    }
}