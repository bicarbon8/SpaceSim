import { ShipPod } from "../ships/ship-pod";
import { Globals } from "../utilities/globals";
import { Mouse } from "../utilities/mouse";
import { CannonAttachment } from "../ships/attachments/offence/cannon-attachment";
import { ZoomableScene } from "./zoomable-scene";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: true,
    visible: true,
    key: 'ShipScene'
};

export class ShipScene extends ZoomableScene {
    private player: ShipPod;
    
    constructor() {
        super(sceneConfig);
    }

    public preload(): void {
        this.load.image('ship-pod', './assets/sprites/ship-pod.png');
        this.load.image('cannon', './assets/sprites/cannon.png');
        this.load.spritesheet('flares', './assets/particles/flares.png', {
            frameWidth: 130,
            frameHeight: 132,
            startFrame: 0,
            endFrame: 4
        });
        this.load.image('explosion', './assets/particles/explosion.png');
        this.load.image('bullet', './assets/sprites/bullet.png');
    }

    public create(): void {
        super.create();
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
        this.game.canvas.oncontextmenu = (e) => {
            e.preventDefault();
        }
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