import { GridLayout, LayoutContainer, Styles, TextButton } from "phaser-ui-components";
import { SpaceSimClient } from "../space-sim-client";
import { Helpers } from "space-sim-server";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'set-name-scene'
};

export class SetNameScene extends Phaser.Scene {
    private _width: number;
    private _height: number;
    private _layout: GridLayout;
    private _text: LayoutContainer;
    private _button: TextButton;
    
    constructor(settingsConfig?: Phaser.Types.Scenes.SettingsConfig) {
        super(settingsConfig || sceneConfig);
    }

    preload() {

    }

    create() {
        this._width = this.game.canvas.width;
        this._height = this.game.canvas.height;

        this.cameras.main.centerOn(0, 0);

        this._createLayout();
        if (this.game.device.os.desktop) {
            this._getKeyboardInput();
        } else {
            this._getMobileTextInput();
        }
    }

    update() {
        if (this._text.contentAs<Phaser.GameObjects.Text>().text.length > 2) {
            this._button.setText({style: Styles.success().text});
            this._button.setBackground(Styles.success().graphics);
        } else {
            this._button.setText({style: Styles.secondary().text});
            this._button.setBackground(Styles.secondary().graphics);
        }
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
                style: Styles.secondary().text
            },
            backgroundStyles: Styles.secondary().graphics,
            onClick: () => {
                this._validateAndStartGame(this._text.contentAs<Phaser.GameObjects.Text>().text);
            }
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
            if (event.key === 'Enter') {
                this._validateAndStartGame(txt);
            }
        });
    }

    private _getMobileTextInput(): void {
        this._text.setInteractive().on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
            const txt: string = window.prompt('Enter player name: (minimum 3 characters consisting of [a-zA-Z0-9])');
            const pname: string = Helpers.sanitise(txt);
            if (pname.length < 3) {
                window.alert('invalid name!');
            } else {
                this._text.contentAs<Phaser.GameObjects.Text>()
                    .setText(pname);
            }
        });
    }

    private _validateAndStartGame(text: string): void {
        const pname = Helpers.sanitise(text);
        if (pname.length > 2) {
            SpaceSimClient.playerData.name = pname;
            this.scene.start('multiplayer-scene');
            this.scene.stop(this);
        }
    }
}