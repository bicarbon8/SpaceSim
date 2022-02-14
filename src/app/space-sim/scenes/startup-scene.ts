import { environment } from "src/environments/environment";
import { Constants } from "../utilities/constants";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: true,
    visible: true,
    key: 'startup-scene'
};

export class StartupScene extends Phaser.Scene {
    private _width: number;
	private _height: number;
    private _sun: Phaser.GameObjects.Sprite;
    private _stars: Phaser.GameObjects.TileSprite;
    
    constructor(settingsConfig?: Phaser.Types.Scenes.SettingsConfig) {
        super(settingsConfig || sceneConfig);
    }

    preload(): void {
        this.load.image('sun', `${environment.baseUrl}/assets/backgrounds/sun.png`);
        this.load.image('venus', `${environment.baseUrl}/assets/backgrounds/venus.png`);
        this.load.image('mercury', `${environment.baseUrl}/assets/backgrounds/mercury.png`);

        this.load.image('far-stars', `${environment.baseUrl}/assets/backgrounds/starfield-tile-512x512.png`);
    }

    create(): void {
        this._width = this.game.canvas.width;
        this._height = this.game.canvas.height;

        this._createBackground();
        this._createStellarBodies();
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
        this._sun = this.add.sprite(0, 0, 'sun');
        this._sun.setDepth(Constants.DEPTH_STELLAR);
        const sunRadius: number = this._sun.width/2;
        const sunScaleFactor: number = sunRadius / this._width; // ex: 100 / 300 = 0.33
        let scaleFactor: number = 1.5 - sunScaleFactor;
        this._sun.setScale(1 + scaleFactor);

        const mercury = this.add.sprite(this._width, this._height, 'mercury');
        mercury.setDepth(Constants.DEPTH_STELLAR);
        const mercuryRadius: number = mercury.width/2;
        const mercuryScaleFactor: number = mercuryRadius / this._width; // ex: 100 / 300 = 0.33
        scaleFactor = 0.25 - mercuryScaleFactor;
        mercury.setScale(1 + scaleFactor);
    }

    private _createTitle(): void {
        const titleText: Phaser.GameObjects.Text = this.add.text(0, 0, 'Spaceship Game', {font: '40px Courier', color: '#6d6dff', stroke: '#ffffff', strokeThickness: 4});
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

        const startText: Phaser.GameObjects.Text = this.add.text(0, 0, 'Press to Start', style);
        startText.setDepth(Constants.DEPTH_CONTROLS);
        startText.setX((this._width/2)-(startText.width/2));
        startText.setY((this._height/2)-(startText.height/2));
        const startButton: Phaser.GameObjects.Rectangle = this.add.rectangle(this._width / 2, this._height / 2, startText.width + 10, startText.height + 10, 0x808080, 0.2);
        startButton.setDepth(Constants.DEPTH_CONTROLS);
        startButton.setInteractive().on(Phaser.Input.Events.POINTER_DOWN, () => {
            this.game.scene.start('gameplay-scene');
            this.game.scene.stop(this);
        }).on(Phaser.Input.Events.POINTER_OVER, () => {
            startButton.setFillStyle(0x80ff80, 0.5);
        }).on(Phaser.Input.Events.POINTER_OUT, () => {
            startButton.setFillStyle(0x808080, 0.2);
        });

        const controlsText: Phaser.GameObjects.Text = this.add.text(0, 0, 'Controls', style);
        controlsText.setDepth(Constants.DEPTH_CONTROLS);
        controlsText.setX((this._width/2)-(controlsText.width/2));
        controlsText.setY((this._height/2)-(controlsText.height/2)+(controlsText.height*2));
        const controlsButton: Phaser.GameObjects.Rectangle = this.add.rectangle(this._width / 2, (this._height / 2) + (controlsText.height*2), startText.width + 10, startText.height + 10, 0x808080, 0.2);
        controlsButton.setDepth(Constants.DEPTH_CONTROLS);
        controlsButton.setInteractive().on(Phaser.Input.Events.POINTER_DOWN, () => {
            // display controls menu
        }).on(Phaser.Input.Events.POINTER_OVER, () => {
            controlsButton.setFillStyle(0x80ff80, 0.5);
        }).on(Phaser.Input.Events.POINTER_OUT, () => {
            controlsButton.setFillStyle(0x808080, 0.2);
        });
    }
}