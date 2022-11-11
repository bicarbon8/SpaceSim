import { environment } from "src/environments/environment";
import { TextButton } from "../ui/text-button";
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
    private _music: Phaser.Sound.BaseSound;
    private _controlsMenu: TextButton;
    
    constructor(settingsConfig?: Phaser.Types.Scenes.SettingsConfig) {
        super(settingsConfig || sceneConfig);
    }

    preload(): void {
        this.load.image('sun', `${environment.baseUrl}/assets/backgrounds/sun.png`);
        this.load.image('venus', `${environment.baseUrl}/assets/backgrounds/venus.png`);
        this.load.image('mercury', `${environment.baseUrl}/assets/backgrounds/mercury.png`);

        this.load.image('far-stars', `${environment.baseUrl}/assets/backgrounds/starfield-tile-512x512.png`);

        this.load.audio('startup-theme', `${environment.baseUrl}/assets/audio/sky-lines.ogg`);
    }

    create(): void {
        this._width = this.game.canvas.width;
        this._height = this.game.canvas.height;

        this._createBackground();
        this._createStellarBodies();
        this._createTitle();
        this._createMenuItems();
        this._createControlsMenu();
        this._createMusic();
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
        this._stars = this.add.tileSprite(this._width/2, this._height/2, this._width, this._height, 'far-stars');
        this._stars.setDepth(Constants.DEPTH_BACKGROUND);
    }

    private _createStellarBodies(): void {
        const smallestDimension: number = (this._width <= this._height) ? this._width : this._height;
        this._sun = this.add.sprite(0, 0, 'sun'); // top left
        this._sun.setDepth(Constants.DEPTH_STELLAR);
        const sunRadius: number = this._sun.width/2;
        const sunScaleFactor: number = smallestDimension / sunRadius; // ex: sunRadius * x = canvasSize
        this._sun.setScale(sunScaleFactor);

        const mercury = this.add.sprite(this._width, this._height, 'mercury'); // bottom right
        mercury.setDepth(Constants.DEPTH_STELLAR);
        const mercuryRadius: number = mercury.width/2;
        const mercuryScaleFactor: number = (smallestDimension / 3) / mercuryRadius; // ex: mercuryRadius * x = canvasSize / 3
        mercury.setScale(mercuryScaleFactor);
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

        const startTextButton: TextButton = new TextButton({
            scene: this,
            x: 0,
            y: 0,
            text: 'Press to Start',
            textStyle: style,
            colour: 0x808080,
            alpha: 0.2,
            padding: 5,
            cornerRadius: 5
        });
        startTextButton.setDepth(Constants.DEPTH_CONTROLS);
        startTextButton.setPosition((this._width/2), (this._height/2));
        startTextButton.setInteractive().on(Phaser.Input.Events.POINTER_DOWN, () => {
            this.game.scene.start('gameplay-scene');
            this._music.stop();
            this.game.scene.stop(this);
        }).on(Phaser.Input.Events.POINTER_OVER, () => {
            startTextButton.setButtonColor(0x80ff80, 0.5);
        }).on(Phaser.Input.Events.POINTER_OUT, () => {
            startTextButton.setButtonColor(0x808080, 0.2);
        });

        const controlsTextButton: TextButton = new TextButton({
            scene: this,
            x: 0,
            y: 0,
            text: 'Controls',
            textStyle: style,
            colour: 0x808080,
            alpha: 0.2,
            padding: {left: 20, top: 5},
            cornerRadius: 5
        });
        controlsTextButton.setDepth(Constants.DEPTH_CONTROLS);
        controlsTextButton.setPosition((this._width/2), (this._height/2)+(controlsTextButton.height*2));
        controlsTextButton.setInteractive().on(Phaser.Input.Events.POINTER_DOWN, () => {
            this._controlsMenu.setActive(true);
            this._controlsMenu.setVisible(true);
        }).on(Phaser.Input.Events.POINTER_OVER, () => {
            controlsTextButton.setButtonColor(0x80ff80, 0.5);
        }).on(Phaser.Input.Events.POINTER_OUT, () => {
            controlsTextButton.setButtonColor(0x808080, 0.2);
        });
    }

    private _createControlsMenu(): void {
        this._controlsMenu = new TextButton({
            scene: this,
            x: this._width/2,
            y: this._height/2,
            text: `Keyboard & Mouse Controls:\n
\tThruster: SPACE\n
\tFire: LEFT MOUSE\n
\tBoost: TAB\n
\tAim: MOVE MOUSE\n
Touch / Mobile Controls:\n
\tThruster: GREEN\n
\tFire: BLUE\n
\tBoost: RED\n
\tAim: LEFT STICK`,
            textStyle: { 
                font: '20px Courier', 
                color: '#ddffdd',
                align: 'left'
            },
            colour: 0x808080,
            alpha: 1,
            padding: 20,
            cornerRadius: 20,
            minHeight: this._height - 10,
            minWidth: this._width - 10
        });
        this._controlsMenu.setDepth(Constants.DEPTH_CONTROLS);
        this._controlsMenu.setInteractive().on(Phaser.Input.Events.POINTER_DOWN, () => {
            this._controlsMenu.setVisible(false);
            this._controlsMenu.setActive(false);
        });
        this._controlsMenu.setVisible(false);
        this._controlsMenu.setActive(false);
    }

    private _createMusic(): void {
        this._music = this.sound.add('startup-theme', {loop: true, volume: 0.1});
        this._music.play();
        this.events.on(Phaser.Scenes.Events.PAUSE, () => this._music.pause());
        this.events.on(Phaser.Scenes.Events.RESUME, () => this._music.resume());
    }
}