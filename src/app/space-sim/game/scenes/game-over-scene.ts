import { environment } from "src/environments/environment";
import { Constants } from "../utilities/constants";
import { GameScoreTracker } from "../utilities/game-score-tracker";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'game-over-scene'
};

export class GameOverScene extends Phaser.Scene {
    private _width: number;
	private _height: number;
    private _sun: Phaser.GameObjects.Sprite;
    private _stars: Phaser.GameObjects.TileSprite;
    
    constructor(settingsConfig?: Phaser.Types.Scenes.SettingsConfig) {
        super(settingsConfig || sceneConfig);
    }

    preload(): void {
        this.load.image('sun', `${environment.baseUrl}/assets/backgrounds/sun.png`);

        this.load.image('far-stars', `${environment.baseUrl}/assets/backgrounds/starfield-tile-512x512.png`);
    }

    create(): void {
        this._width = this.game.canvas.width;
        this._height = this.game.canvas.height;

        this._createBackground();
        this._createStellarBodies();
        this._createScore();
        this._createTitle();
        this._createMenuItems();
    }

    update(time: number, delta: number): void {
        this._sun.angle += 0.5 / delta;
        if (this._sun.angle >= 360) {
            this._sun.angle = 0;
        }
        this._stars.tilePositionX += 0.01;
        this._stars.tilePositionY += 0.02;
    }

    private _createBackground(): void {
        this._stars = this.add.tileSprite(this._width/2, this._height/2, this._width*3, this._height*3, 'far-stars');
        this._stars.setDepth(Constants.DEPTH_BACKGROUND);
    }

    private _createStellarBodies(): void {
        this._sun = this.add.sprite(this._width / 2, this._height / 2, 'sun');
        this._sun.setDepth(Constants.DEPTH_STELLAR);
        const smallestDimension: number = (this._width <= this._height) ? this._width : this._height;
        const sunRadius: number = this._sun.width/2;
        const sunScaleFactor: number = smallestDimension / sunRadius;
        this._sun.setScale(sunScaleFactor);
    }

    private _createScore(): void {
        const titleText: Phaser.GameObjects.Text = this.add.text(0, 0, `Score: ${GameScoreTracker.getScore().toFixed(0)}`, {font: '40px Courier', color: '#ff8080', stroke: '#ff0000', strokeThickness: 4});
        titleText.setDepth(Constants.DEPTH_CONTROLS);
        titleText.setX((this._width/2)-(titleText.width/2));
        titleText.setY(titleText.height);
    }

    private _createTitle(): void {
        const titleText: Phaser.GameObjects.Text = this.add.text(0, 0, 'GAME OVER', {font: '40px Courier', color: '#ff8080', stroke: '#ff0000', strokeThickness: 4});
        titleText.setDepth(Constants.DEPTH_CONTROLS);
        titleText.setX((this._width/2)-(titleText.width/2));
        titleText.setY((this._height/2)-(titleText.height/2)-(titleText.height*2));
    }

    private _createMenuItems(): void {
        const style = { 
            font: '20px Courier', 
            color: '#ddffdd',
            align: 'center'
        };

        const startText: Phaser.GameObjects.Text = this.add.text(0, 0, 'Press to Restart', style);
        startText.setDepth(Constants.DEPTH_CONTROLS);
        startText.setX((this._width/2)-(startText.width/2));
        startText.setY((this._height/2)-(startText.height/2));
        const startButton: Phaser.GameObjects.Rectangle = this.add.rectangle(this._width / 2, this._height / 2, startText.width + 10, startText.height + 10, 0xff6060, 0.5);
        startButton.setDepth(Constants.DEPTH_CONTROLS - 0.1);
        startButton.setInteractive().on(Phaser.Input.Events.POINTER_DOWN, () => {
            this.game.scene.start('gameplay-scene');
            this.game.scene.stop(this);
        }).on(Phaser.Input.Events.POINTER_OVER, () => {
            startButton.setFillStyle(0x80ff80, 1);
            startText.setColor('8d8d8d');
        }).on(Phaser.Input.Events.POINTER_OUT, () => {
            startButton.setFillStyle(0xff6060, 0.5);
            startText.setColor(style.color);
        });

        const controlsText: Phaser.GameObjects.Text = this.add.text(0, 0, 'Return to Menu', style);
        controlsText.setDepth(Constants.DEPTH_CONTROLS);
        controlsText.setX((this._width/2)-(controlsText.width/2));
        controlsText.setY((this._height/2)-(controlsText.height/2)+(controlsText.height*2));
        const controlsButton: Phaser.GameObjects.Rectangle = this.add.rectangle(this._width / 2, (this._height / 2) + (controlsText.height*2), startText.width + 10, startText.height + 10, 0xff6060, 0.5);
        controlsButton.setDepth(Constants.DEPTH_CONTROLS - 0.1);
        controlsButton.setInteractive().on(Phaser.Input.Events.POINTER_DOWN, () => {
            this.game.scene.start('startup-scene');
            this.game.scene.stop(this);
        }).on(Phaser.Input.Events.POINTER_OVER, () => {
            controlsButton.setFillStyle(0x80ff80, 1);
            controlsText.setColor('8d8d8d');
        }).on(Phaser.Input.Events.POINTER_OUT, () => {
            controlsButton.setFillStyle(0xff6060, 0.5);
            controlsText.setColor(style.color);
        });
    }
}