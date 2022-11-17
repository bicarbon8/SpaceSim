import { Card, CardHeader, FlexLayout, LinearLayout, Styles, TextButton } from "phaser-ui-components";
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
    private _music: Phaser.Sound.BaseSound;
    private _controlsMenu: Card;
    
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

        this.cameras.main.centerOn(0, 0);

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
        this._stars = this.add.tileSprite(0, 0, this._width, this._height, 'far-stars');
        this._stars.setDepth(Constants.DEPTH_BACKGROUND);
    }

    private _createStellarBodies(): void {
        const smallestDimension: number = (this._width <= this._height) ? this._width : this._height;
        this._sun = this.add.sprite(-this._width/2, -this._height/2, 'sun'); // top left
        this._sun.setDepth(Constants.DEPTH_STELLAR);
        const sunRadius: number = this._sun.width/2;
        const sunScaleFactor: number = smallestDimension / sunRadius; // ex: sunRadius * x = canvasSize
        this._sun.setScale(sunScaleFactor);

        const mercury = this.add.sprite(this._width/2, this._height/2, 'mercury'); // bottom right
        mercury.setDepth(Constants.DEPTH_STELLAR);
        const mercuryRadius: number = mercury.width/2;
        const mercuryScaleFactor: number = (smallestDimension / 3) / mercuryRadius; // ex: mercuryRadius * x = canvasSize / 3
        mercury.setScale(mercuryScaleFactor);
    }

    private _createTitle(): void {
        
    }

    private _createMenuItems(): void {
        const layout = new LinearLayout(this, {
            alignment: { horizontal: 'center', vertical: 'middle' },
            orientation: 'vertical',
            x: 0,
            y: 0,
            padding: 10
        });
        layout.setDepth(Constants.DEPTH_CONTROLS);
        this.add.existing(layout);

        const titleText: Phaser.GameObjects.Text = this.add.text(0, 0, 'Spaceship Game', {font: '40px Courier', color: '#6d6dff', stroke: '#ffffff', strokeThickness: 4});
        layout.addContents(titleText);

        const buttonTextStyle = { 
            font: '20px Courier', 
            color: '#ddffdd',
            align: 'center'
        };

        const startTextButton: TextButton = new TextButton(this, {
            desiredWidth: 250,
            text: {
                text: 'Press to Start',
                style: buttonTextStyle,
            },
            background: {fillStyle: {color: 0x808080, alpha: 0.2}},
            padding: 5,
            cornerRadius: 15,
            interactive: true
        });
        startTextButton.setPosition((this._width/2), (this._height/2));
        startTextButton.on(Phaser.Input.Events.POINTER_DOWN, () => {
            this.game.scene.start('gameplay-scene');
            this.game.scene.stop(this);
        }).on(Phaser.Input.Events.POINTER_OVER, () => {
            startTextButton.setBackground({fillStyle: {color: 0x80ff80, alpha: 0.5}});
        }).on(Phaser.Input.Events.POINTER_OUT, () => {
            startTextButton.setBackground({fillStyle: {color: 0x808080, alpha: 0.2}});
        });
        layout.addContents(startTextButton);

        const controlsTextButton: TextButton = new TextButton(this, {
            desiredWidth: 250,
            text: {text: 'Controls', style: buttonTextStyle},
            background: {fillStyle: {color: 0x808080, alpha: 0.2}},
            padding: 5,
            cornerRadius: 15,
            interactive: true
        });
        controlsTextButton.setPosition((this._width/2), (this._height/2)+(controlsTextButton.height*2));
        controlsTextButton.on(Phaser.Input.Events.POINTER_DOWN, () => {
            this._controlsMenu.setActive(true);
            this._controlsMenu.setVisible(true);
        }).on(Phaser.Input.Events.POINTER_OVER, () => {
            controlsTextButton.setBackground({fillStyle: {color: 0x80ff80, alpha: 0.5}});
        }).on(Phaser.Input.Events.POINTER_OUT, () => {
            controlsTextButton.setBackground({fillStyle: {color: 0x808080, alpha: 0.2}});
        });
        layout.addContents(controlsTextButton);
    }

    private _createControlsMenu(): void {
        const closeButton = new TextButton(this, {
            text: {text: 'Close', style: Styles.Outline.success().text},
            background: Styles.Outline.success().graphics,
            cornerRadius: 20,
            interactive: true,
            desiredWidth: 300,
            padding: 10
        });
        closeButton.on(Phaser.Input.Events.POINTER_DOWN, () => {
            this._controlsMenu.setVisible(false);
            this._controlsMenu.setActive(false);
        }).on(Phaser.Input.Events.POINTER_OVER, () => {
            closeButton.setBackground(Styles.success().graphics)
                .setText({style: Styles.success().text});
        }).on(Phaser.Input.Events.POINTER_OUT, () => {
            closeButton.setBackground(Styles.Outline.success().graphics)
            .setText({style: Styles.Outline.success().text});
        });

        this._controlsMenu = new Card(this, {
            desiredWidth: this._width * 0.98,
            desiredHeight: this._height * 0.98,
            cornerRadius: 20,
            padding: 10,
            header: {
                text: {text: 'Game Controls:', style: Styles.info().text},
                background: Styles.info().graphics
            },
            body: {
                background: Styles.light().graphics,
                contents: [
                    new FlexLayout(this, {
                        padding: 5,
                        contents: [
                            new Card(this, {
                                desiredWidth: 300,
                                header: {
                                    text: {text: 'Keyboard & Mouse:', style: Styles.warning().text },
                                    background: Styles.warning().graphics
                                },
                                body: {
                                    background: Styles.Outline.dark().graphics,
                                    contents: [
                                        this.make.text({
                                            text: `Thruster: SPACE\nFire: LEFT MOUSE\nBoost: TAB\nAim: MOVE MOUSE`,
                                            style: Styles.light().text
                                        }, false),
                                    ]
                                },
                                padding: 5,
                                cornerRadius: 10
                            }),
                            new Card(this, {
                                desiredWidth: 300,
                                header: {
                                    text: {text: 'Touch / Mobile:', style: Styles.warning().text },
                                    background: Styles.warning().graphics
                                },
                                body: {
                                    background: Styles.Outline.dark().graphics,
                                    contents: [
                                        this.make.text({
                                            text: `Thruster: GREEN\nFire: BLUE\nBoost: RED\nAim: LEFT STICK`,
                                            style: Styles.light().text
                                        }, false)
                                    ]
                                },
                                padding: 5,
                                cornerRadius: 10
                            })
                        ]
                    }),
                    closeButton
                ]
            }
        });
        this._controlsMenu.cardbody.refreshLayout();
        this._controlsMenu.setDepth(Constants.DEPTH_CONTROLS);
        this._controlsMenu.setVisible(false);
        this._controlsMenu.setActive(false);
        this.add.existing(this._controlsMenu);
    }

    private _createMusic(): void {
        this._music = this.sound.add('startup-theme', {loop: true, volume: 0.1});
        this._music.play();
        this.events.on(Phaser.Scenes.Events.PAUSE, () => this._music.pause());
        this.events.on(Phaser.Scenes.Events.RESUME, () => this._music.resume());
        this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => this._music.stop());
        this.events.on(Phaser.Scenes.Events.DESTROY, () => this._music.destroy());
    }
}