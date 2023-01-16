import { Card, Colors, FlexLayout, LayoutContainer, LinearLayout, Styles, TextButton } from "phaser-ui-components";
import { environment } from "src/environments/environment";
import { SpaceSimClient } from "../space-sim-client";
import { Constants, Helpers } from "space-sim-shared";

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
    private _startMultiplayerButton: TextButton;
    private _serverConnectionText: LayoutContainer;
    private _medPriUpdateAt: number = Constants.Timing.MED_PRI_UPDATE_FREQ;
    private _lowPriUpdateAt: number = Constants.Timing.LOW_PRI_UPDATE_FREQ;
    private _ultraLowPriUpdateAt: number = Constants.Timing.ULTRALOW_PRI_UPDATE_FREQ;

    readonly buttonTextStyle = { 
        font: '20px Courier', 
        color: '#ddffdd',
        align: 'center'
    } as const;
    readonly buttonDisabledTextStyle = {
        ...this.buttonTextStyle, 
        color: Colors.toHexString(Colors.secondary),
        alpha: 0.2
    } as const;
    readonly buttonBackgroundStyle = {
        fillStyle: {color: 0x808080, alpha: 0.2}
    } as const;
    readonly buttonHoverBackgroundStyle = {
        fillStyle: {color: 0x80ff80, alpha: 0.5}
    } as const;
    readonly buttonDisabledBackgroundStyle = {
        ...this.buttonBackgroundStyle,
        alpha: 0.1
    } as const;
    
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
        SpaceSimClient.mode = 'singleplayer';
        this._width = this.game.canvas.width;
        this._height = this.game.canvas.height;

        this.cameras.main.centerOn(0, 0);

        this._createBackground();
        this._createStellarBodies();
        this._createMenuItems();
        this._createControlsMenu();
        this._createMusic();
    }

    update(time: number, delta: number): void {
        this._medPriUpdateAt += delta;
        this._lowPriUpdateAt += delta;
        this._ultraLowPriUpdateAt += delta;

        this._sun.angle += 0.5 / delta;
        if (this._sun.angle >= 360) {
            this._sun.angle = 0;
        }
        this._stars.tilePositionX += 0.01;
        this._stars.tilePositionY += 0.02;
        
        if (this._ultraLowPriUpdateAt >= Constants.Timing.ULTRALOW_PRI_UPDATE_FREQ) {
            this._ultraLowPriUpdateAt = 0;
            if (SpaceSimClient.socket?.connected) {
                this._enableMultiplayer();
            } else {
                this._disableMultiplayer();
            }
        }
    }

    private _createBackground(): void {
        this._stars = this.add.tileSprite(0, 0, this._width, this._height, 'far-stars');
        this._stars.setDepth(Constants.UI.Layers.BACKGROUND);
    }

    private _createStellarBodies(): void {
        const smallestDimension: number = (this._width <= this._height) ? this._width : this._height;
        this._sun = this.add.sprite(-this._width/2, -this._height/2, 'sun'); // top left
        this._sun.setDepth(Constants.UI.Layers.STELLAR);
        const sunRadius: number = this._sun.width/2;
        const sunScaleFactor: number = smallestDimension / sunRadius; // ex: sunRadius * x = canvasSize
        this._sun.setScale(sunScaleFactor);

        const mercury = this.add.sprite(this._width/2, this._height/2, 'mercury'); // bottom right
        mercury.setDepth(Constants.UI.Layers.STELLAR);
        const mercuryRadius: number = mercury.width/2;
        const mercuryScaleFactor: number = (smallestDimension / 3) / mercuryRadius; // ex: mercuryRadius * x = canvasSize / 3
        mercury.setScale(mercuryScaleFactor);
    }

    private _createMenuItems(): void {
        const layout = new LinearLayout(this, {
            alignment: { horizontal: 'center', vertical: 'middle' },
            orientation: 'vertical',
            x: 0,
            y: 0,
            padding: 10
        });
        layout.setDepth(Constants.UI.Layers.HUD);
        this.add.existing(layout);

        const titleText: Phaser.GameObjects.Text = this.add.text(0, 0, 'Spaceship Game', {font: '40px Courier', color: '#6d6dff', stroke: '#ffffff', strokeThickness: 4});
        layout.addContents(titleText);

        const startSingleplayerTextButton: TextButton = new TextButton(this, {
            width: 250,
            textConfig: {
                text: 'Single-Player',
                style: this.buttonTextStyle,
            },
            backgroundStyles: this.buttonBackgroundStyle,
            padding: 5,
            cornerRadius: 14,
            onClick: () => {
                this.game.scene.start('gameplay-scene');
                this.game.scene.stop(this);
            },
            onHover: () => {
                startSingleplayerTextButton.setBackground(this.buttonHoverBackgroundStyle);
            }
        });
        layout.addContents(startSingleplayerTextButton);

        this._startMultiplayerButton = new TextButton(this, {
            width: 250,
            textConfig: {
                text: 'Multi-Player',
                style: this.buttonDisabledTextStyle,
            },
            backgroundStyles: this.buttonDisabledBackgroundStyle,
            padding: 5,
            cornerRadius: 14
        });
        
        layout.addContents(this._startMultiplayerButton);

        const controlsTextButton: TextButton = new TextButton(this, {
            width: 250,
            textConfig: {text: 'Controls', style: this.buttonTextStyle},
            backgroundStyles: this.buttonBackgroundStyle,
            padding: 5,
            cornerRadius: 14,
            onClick: () => {
                this._controlsMenu.setActive(true);
                this._controlsMenu.setVisible(true);
            },
            onHover: () => {
                controlsTextButton.setBackground(this.buttonHoverBackgroundStyle);
            }
        });
        layout.addContents(controlsTextButton);

        this._serverConnectionText = new LayoutContainer(this, {
            width: layout.width - (layout.padding * 2),
            content: this.make.text({
                text: 'Connecting to server...',
                style: Styles.Outline.light().text
            })
        });
        layout.addContents(this._serverConnectionText);
    }

    private _createControlsMenu(): void {
        const closeButton = new TextButton(this, {
            textConfig: {text: 'Close', style: Styles.Outline.success().text},
            backgroundStyles: Styles.Outline.success().graphics,
            cornerRadius: 20,
            width: 300,
            padding: 10,
            onClick: () => {
                this._controlsMenu.setVisible(false);
                this._controlsMenu.setActive(false);
            },
            onHover: () => {
                closeButton.setText({style: Styles.success().text})
                    .setBackground(Styles.success().graphics);
            }
        });

        this._controlsMenu = new Card(this, {
            desiredWidth: this._width * 0.98,
            desiredHeight: this._height * 0.98,
            cornerRadius: 20,
            padding: 10,
            header: {
                textConfig: {text: 'Game Controls:', style: Styles.info().text},
                backgroundStyles: Styles.info().graphics
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
                                    textConfig: {text: 'Keyboard & Mouse:', style: Styles.warning().text },
                                    backgroundStyles: Styles.warning().graphics
                                },
                                body: {
                                    background: Styles.Outline.dark().graphics,
                                    contents: [
                                        this.make.text({
                                            text: `Thruster: SPACE\nFire: LEFT MOUSE\nAim: MOVE MOUSE`,
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
                                    textConfig: {text: 'Touch / Mobile:', style: Styles.warning().text },
                                    backgroundStyles: Styles.warning().graphics
                                },
                                body: {
                                    background: Styles.Outline.dark().graphics,
                                    contents: [
                                        this.make.text({
                                            text: `Thruster: GREEN (A)\nFire: BLUE (X)\nAim: LEFT STICK`,
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
        this._controlsMenu.setDepth(Constants.UI.Layers.HUD);
        this._controlsMenu.setVisible(false);
        this._controlsMenu.setActive(false);
        this.add.existing(this._controlsMenu);
    }

    private _createMusic(): void {
        Helpers.trycatch(() => this._music = this.sound.add('startup-theme', {loop: true, volume: 0.1}), 'warn');
        this._music?.play();
        this.events.on(Phaser.Scenes.Events.PAUSE, () => this._music?.pause());
        this.events.on(Phaser.Scenes.Events.RESUME, () => this._music?.resume());
        this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => this._music?.stop());
        this.events.on(Phaser.Scenes.Events.DESTROY, () => this._music?.destroy());
    }

    private _enableMultiplayer(): void {
        const connectedText = 'Server connection established';
        if (this._serverConnectionText.contentAs<Phaser.GameObjects.Text>().text !== connectedText) {
            this._serverConnectionText.contentAs<Phaser.GameObjects.Text>()
                    .setText(connectedText);
            this._serverConnectionText?.updateSize();
            this._startMultiplayerButton
                .setText({style: this.buttonTextStyle})
                .setOnClick(() => {
                    this.game.scene.start('set-name-scene');
                    this.game.scene.stop(this);
                })
                .setOnHover(() => {
                    this._startMultiplayerButton.setBackground(this.buttonHoverBackgroundStyle);
                });
        }
    }

    private _disableMultiplayer(): void {
        const disconnectedText = 'Connecting to server...';
        if (this._serverConnectionText.contentAs<Phaser.GameObjects.Text>().text !== disconnectedText) {
            this._serverConnectionText.contentAs<Phaser.GameObjects.Text>()
                    .setText(disconnectedText);
            this._serverConnectionText?.updateSize();
            this._startMultiplayerButton
                .setText({style: this.buttonDisabledTextStyle})
                .setOnClick(null)
                .setOnHover(null);
        }
    }
}