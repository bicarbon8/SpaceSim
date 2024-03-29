import { GridLayout, LayoutContainer, Styles, TextButton } from "phaser-ui-components";
import { SpaceSimClient } from "../space-sim-client";
import { Sanitiser, SpaceSim, TryCatch } from "space-sim-shared";
import { environment } from "../../../../environments/environment";
import getBrowserFingerprint from "get-browser-fingerprint";

export const SetNameSceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'set-name-scene'
} as const;

export class SetNameScene extends Phaser.Scene {
    private _width: number;
    private _height: number;
    private _layout: GridLayout;
    private _text: LayoutContainer;
    private _button: TextButton;
    private _music: Phaser.Sound.BaseSound;

    private readonly _continueButtonStylesDisabled;
    
    constructor(settingsConfig?: Phaser.Types.Scenes.SettingsConfig) {
        super(settingsConfig || SetNameSceneConfig);

        this._continueButtonStylesDisabled = Styles.Outline.secondary();
    }

    preload() {
        this.load.audio('startup-theme', `${environment.baseUrl}/assets/audio/sky-lines.ogg`);
    }

    create() {
        SpaceSimClient.mode = 'multiplayer';
        this._width = this.game.canvas.width;
        this._height = this.game.canvas.height;
        
        this.cameras.main.centerOn(0, 0);

        this._createMusic();
        this._createLayout();
        if (this.game.device.os.desktop) {
            this._getKeyboardInput();
        } else {
            this._getMobileTextInput();
        }

        if (SpaceSim.UserData.isValid(SpaceSimClient.playerData)) {
            this._text.contentAs<Phaser.GameObjects.Text>().setText(SpaceSimClient.playerData.name);
            this._updateContinueButton();
        }
    }

    update() {
        
    }

    private _createMusic(): void {
        TryCatch.run(() => this._music = this.sound.add('startup-theme', {loop: true, volume: 0.1}), 'warn');
        this._music?.play();
        this.events.on(Phaser.Scenes.Events.PAUSE, () => this._music?.pause());
        this.events.on(Phaser.Scenes.Events.RESUME, () => this._music?.resume());
        this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => this._music?.stop());
        this.events.on(Phaser.Scenes.Events.DESTROY, () => this._music?.destroy());
    }

    private _createLayout(): void {
        this._layout = new GridLayout(this, {
            rows: 3,
            columns: 1,
            padding: 10
        });
        this.add.existing(this._layout);
        this._layout.addContentAt(0, 0, this.make.text({
            text: 'Enter player name:',
            style: {
                font: '40px Courier', 
                color: '#6d6dff', 
                stroke: '#ffffff', 
                strokeThickness: 4
            }
        }));

        this._text = new LayoutContainer(this, {
            padding: 10,
            cornerRadius: 10,
            backgroundStyles: Styles.Outline.primary().graphics,
            width: this._layout.width - (this._layout.padding * 2),
            content: this.make.text({
                text: '',
                style: Styles.Outline.primary().text
            })
        });
        this._layout.addContentAt(1, 0, this._text);

        this._button = new TextButton(this, {
            padding: 10,
            cornerRadius: 10,
            textConfig: {
                text: 'Continue',
                style: this._continueButtonStylesDisabled.text
            },
            backgroundStyles: this._continueButtonStylesDisabled.graphics
        });
        this._layout.addContentAt(2, 0, this._button);
    }

    private _getKeyboardInput(): void {
        this.input.keyboard.on(Phaser.Input.Keyboard.Events.ANY_KEY_DOWN, (event: KeyboardEvent) => {
            // console.log(`input:`, event);
            const txtGo = this._text.contentAs<Phaser.GameObjects.Text>();
            const txt = txtGo.text;
            if (event.key === 'Backspace') {
                txtGo.setText(txt.substring(0, txt.length - 1));
            }
            if (event.key.length === 1 && event.key.match(/[a-zA-Z0-9]/)) {
                if (txt.length < 10) {
                    txtGo.setText(txt + event.key);
                }
            }

            this._updateContinueButton();

            if (event.key === 'Enter') {
                this._validateAndStartGame(txt);
            }
        });
    }

    private _getMobileTextInput(): void {
        this._text.setInteractive().on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
            const txt: string = window.prompt('Enter player name: (minimum 3 characters consisting of [a-zA-Z0-9])');
            this._button.contentAs<Phaser.GameObjects.Text>().setText(txt);
            this._updateContinueButton();
            this._validateAndStartGame(txt);
        });
    }

    private _validateAndStartGame(text: string): void {
        const pname = Sanitiser.sanitise(text);
        if (pname.length > 2) {
            SpaceSimClient.socket.sendSetPlayerDataRequest({
                fingerprint: getBrowserFingerprint(),
                name: pname
            });
        } else {
            window.alert('invalid name!');
        }
    }

    private _updateContinueButton(): void {
        if (this._button.contentAs<Phaser.GameObjects.Text>().text.length > 2) {
            const style = Styles.success();
            this._button.setText({style: style.text})
                .setBackground(style.graphics)
                .setOnClick(() => {
                    this._validateAndStartGame(this._text.contentAs<Phaser.GameObjects.Text>().text);
                });
        } else {
            this._button.setText({style: this._continueButtonStylesDisabled.text})
                .setBackground(this._continueButtonStylesDisabled.graphics)
                .setOnClick(null);
        }
    }
}