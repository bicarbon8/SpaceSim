import { Globals } from "../utilities/globals";
import { Helpers } from "../utilities/helpers";
import { ZoomableScene } from "./zoomable-scene";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: true,
    visible: true,
    key: 'SystemScene'
};

export class SystemScene extends ZoomableScene {
    sun: Phaser.GameObjects.Sprite;
    startPosition: Phaser.Math.Vector2;
    
    constructor(settingsConfig?: Phaser.Types.Scenes.SettingsConfig) {
        let conf: Phaser.Types.Scenes.SettingsConfig = settingsConfig || sceneConfig;
        super(0.05, conf);
    }
    
    public preload(): void {
        this.load.image('sun', './assets/backgrounds/sun.png');
    }

    public create(): void {
        super.create();
        this.startPosition = new Phaser.Math.Vector2(
            Phaser.Math.RND.between(0, this.game.canvas.width),
            Phaser.Math.RND.between(0, this.game.canvas.height)
        );
        this.sun = this.add.sprite(this.startPosition.x, this.startPosition.y, 'sun');
    }
    
    update(): void {
        this.sun.angle += 0.01;
        if (this.sun.angle >= 360) {
            this.sun.angle = 0;
        }
        // move the sun in the opposite direction of travel at a rate of 1:500
        let loc: Phaser.Math.Vector2 = Globals.player?.getRealLocation() || Helpers.vector2();
        loc.divide(new Phaser.Math.Vector2(500, 500));
        loc.negate();

        this.sun.x = this.startPosition.x + loc.x;
        this.sun.y = this.startPosition.y + loc.y;
    }
}