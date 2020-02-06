import { ZoomableScene } from "./zoomable-scene";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: true,
    visible: true,
    key: 'FarStars'
};

export class FarStarsScene extends ZoomableScene {
    constructor() {
        super(sceneConfig);
    }

    public preload(): void {
        this.load.image('far-stars', './assets/backgrounds/starfield-tile-512x512.png');
    }

    public create(): void {
        super.create();
        let xOffset: number = Math.ceil(this.game.canvas.width / 2);
        let yOffset: number = Math.ceil(this.game.canvas.height / 2);
        this.add.tileSprite(xOffset, yOffset, this.game.canvas.width * 10, this.game.canvas.height * 10, 'far-stars');
    }

    public update(): void {
        
    }
}