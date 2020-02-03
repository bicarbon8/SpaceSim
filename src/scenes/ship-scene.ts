import { ShipPod } from "../ships/ship-pod";
import { Globals } from "../utilities/globals";
import { Mouse } from "../utilities/mouse";
import { CannonAttachment } from "../ships/attachments/offence/cannon-attachment";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: true,
    visible: true,
    key: 'ShipScene'
};

export class ShipScene extends Phaser.Scene {
    private mouse: Mouse;
    private player: ShipPod;
    
    constructor() {
        super(sceneConfig);
    }

    public preload(): void {
        this.load.image('stars', './assets/backgrounds/tileableStars.png');
        this.load.image('ship-pod', './assets/sprites/ship-pod.png');
        this.load.atlas('flares', './assets/particles/flares.png', './assets/particles/flares.json');
    }

    public create(): void {
        this.add.tileSprite(0, 0, this.cameras.main.width * 10, this.cameras.main.height * 10, 'stars');

        this.mouse = new Mouse(this);
        this.player = new ShipPod(this);
        Globals.player = this.player;
        this.player.setTarget(this.mouse);

        // TMP
        let canon: CannonAttachment = new CannonAttachment(this);
        this.player.addAttachment(canon);

        this.setupCamera(this.player);
        
        this.input.keyboard.on('keydown-P', () => {
            Globals.paused = true;
        });
        this.input.keyboard.on('keydown-R', () => {
            Globals.paused = false;
        });
        this.mouse.onWheelUp((scrollAmount: number) => {
            let currentZoom: number = this.cameras.main.zoom;
            // zoom out
            let newZoom: number = currentZoom - 0.5;
            if (newZoom < 0.1) {
                newZoom = 0.1;
            }
            // console.log(`zooming from ${currentZoom} to ${newZoom}`);
            this.cameras.main.zoomTo(newZoom);
        });
        this.mouse.onWheelDown((scrollAmount: number) => {
            let currentZoom: number = this.cameras.main.zoom;
            // zoom in
            let newZoom: number = currentZoom + 0.5;
            if (newZoom > 1) {
                newZoom = 1;
            }
            // console.log(`zooming from ${currentZoom} to ${newZoom}`);
            this.cameras.main.zoomTo(newZoom);
        });
    }

    public update(): void {
        if (!Globals.paused) {
            Globals.player.update();
        }
    }

    private setupCamera(player: ShipPod): void {
        this.cameras.main.backgroundColor.setFromRGB({r: 0, g: 0, b: 0});
        
        this.cameras.main.setZoom(1);
        this.cameras.main.centerOn(0, 0);

        let width: number = this.cameras.main.width;
        let height: number = this.cameras.main.height;
        let dzWidth: number = Math.floor(width / 2);
        let dzHeight: number = Math.floor(height / 2);
        let dzX: number = Math.floor(dzWidth / 2);
        let dzY: number = Math.floor(dzHeight / 2);
        this.cameras.main.startFollow(player.getGameObject(), true);
        this.cameras.main.deadzone = new Phaser.Geom.Rectangle(dzX, dzY, dzWidth, dzHeight);
    }
}