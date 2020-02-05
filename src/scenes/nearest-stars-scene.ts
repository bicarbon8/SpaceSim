import { Globals } from "../utilities/globals";
import { ZoomableScene } from "./zoomable-scene";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: true,
    visible: true,
    key: 'NearestStars'
};

export class NearestStarsScene extends ZoomableScene {
    private background: Phaser.GameObjects.TileSprite;

    constructor() {
        super(sceneConfig);
    }

    public preload(): void {
        this.load.image('near-stars', './assets/backgrounds/starfield-tile-512x512.png');
    }

    public create(): void {
        super.create();
        this.background = this.add.tileSprite(0, 0, this.cameras.main.width * 10, this.cameras.main.height * 10, 'near-stars');
        this.background.setScale(2);
        this.background.setAngle(90);
    }

    public update(): void {
        if (Globals.player) {
            let loc: Phaser.Math.Vector2 = Globals.player.getRealLocation();
            loc.divide(new Phaser.Math.Vector2(500, 500));
            loc.negate();
            this.cameras.main.setPosition(loc.x, loc.y);
        }
    }
}