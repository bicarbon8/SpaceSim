import { Card, FlexLayout, LinearLayout, Styles, TextButton } from "phaser-ui-components";
import { environment } from "src/environments/environment";
import { SpaceSimClient } from "../space-sim-client";
import { Constants } from "space-sim-server";
import { io, Socket } from "socket.io-client";
import { DisconnectDescription } from "socket.io-client/build/esm/socket";

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
        this._createMenuItems();
        this._createControlsMenu();
        this._createMusic();
        this._createSocket();
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

        const buttonTextStyle = { 
            font: '20px Courier', 
            color: '#ddffdd',
            align: 'center'
        };

        const startSingleplayerTextButton: TextButton = new TextButton(this, {
            width: 250,
            textConfig: {
                text: 'Single-Player',
                style: buttonTextStyle,
            },
            backgroundStyles: {fillStyle: {color: 0x808080, alpha: 0.2}},
            padding: 5,
            cornerRadius: 15,
            onClick: () => {
                this.game.scene.start('gameplay-scene');
                this.game.scene.stop(this);
            },
            onHover: () => {
                startSingleplayerTextButton.setBackground({fillStyle: {color: 0x80ff80, alpha: 0.5}});
            }
        });
        layout.addContents(startSingleplayerTextButton);

        this._startMultiplayerButton = new TextButton(this, {
            width: 250,
            textConfig: {
                text: 'Multi-Player',
                style: buttonTextStyle,
            },
            backgroundStyles: {fillStyle: {color: 0x808080, alpha: 0.2}},
            padding: 5,
            cornerRadius: 15,
            onClick: () => {
                this.game.scene.start('multiplayer-scene');
                this.game.scene.stop(this);
            },
            onHover: () => {
                this._startMultiplayerButton.setBackground({fillStyle: {color: 0x80ff80, alpha: 0.5}});
            }
        });
        if (!SpaceSimClient.socket || !SpaceSimClient.socket?.connected) {
            this._startMultiplayerButton.setActive(false)
                .setVisible(false);
        }
        layout.addContents(this._startMultiplayerButton);

        const controlsTextButton: TextButton = new TextButton(this, {
            width: 250,
            textConfig: {text: 'Controls', style: buttonTextStyle},
            backgroundStyles: {fillStyle: {color: 0x808080, alpha: 0.2}},
            padding: 5,
            cornerRadius: 15,
            onClick: () => {
                this._controlsMenu.setActive(true);
                this._controlsMenu.setVisible(true);
            },
            onHover: () => {
                controlsTextButton.setBackground({fillStyle: {color: 0x80ff80, alpha: 0.5}});
            }
        });
        layout.addContents(controlsTextButton);
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
        this._music = this.sound.add('startup-theme', {loop: true, volume: 0.1});
        this._music.play();
        this.events.on(Phaser.Scenes.Events.PAUSE, () => this._music.pause());
        this.events.on(Phaser.Scenes.Events.RESUME, () => this._music.resume());
        this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => this._music.stop());
        this.events.on(Phaser.Scenes.Events.DESTROY, () => this._music.destroy());
    }

    private _createSocket(): void {
        if (!SpaceSimClient.socket || SpaceSimClient.socket.disconnected) {
            SpaceSimClient.socket = io(`ws://${environment.websocket}`);
            SpaceSimClient.socket.on('connect', () => {
                console.debug(`connected to server at: ${environment.websocket}`);
                this._startMultiplayerButton
                    .setActive(true)
                    .setVisible(true);
            }).on('disconnect', (reason: Socket.DisconnectReason, description: DisconnectDescription) => {
                console.warn(`socket disconnect`, reason, description);
                if (reason === "io server disconnect") {
                    // the disconnection was initiated by the server, you need to reconnect manually
                    console.info(`attempting to reconnect to server...`);
                    SpaceSimClient.socket.connect();
                }
            });
        }
    }
}