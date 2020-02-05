import { Globals } from "../utilities/globals";
import { ZoomableScene } from "./zoomable-scene";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: true,
    visible: true,
    key: 'FarthestStars'
};

export class FarthestStarsScene extends ZoomableScene {
    private background: Phaser.GameObjects.TileSprite;

    constructor() {
        super(sceneConfig);
    }

    public preload(): void {
        this.load.image('far-stars', './assets/backgrounds/starfield-tile-512x512.png');
    }

    public create(): void {
        super.create();
        this.background = this.add.tileSprite(0, 0, this.cameras.main.width * 10, this.cameras.main.height * 10, 'far-stars');
    }

    public update(): void {
        if (Globals.player) {
            let loc: Phaser.Math.Vector2 = Globals.player.getRealLocation();
            loc.divide(new Phaser.Math.Vector2(1000, 1000));
            loc.negate();
            this.cameras.main.setPosition(loc.x, loc.y);
        }
    }
}