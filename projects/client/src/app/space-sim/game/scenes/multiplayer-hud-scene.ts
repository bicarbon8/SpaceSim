import { Constants, GameScoreTracker, GameStats, SpaceSim } from "space-sim-server";
import { SpaceSimClient } from "../space-sim-client";
import { InputController } from "../controllers/input-controller";
import { TouchController } from "../controllers/touch-controller";
import { KbmController } from "../controllers/kbm-controller";
import { Resizable } from "../interfaces/resizable";
import { GridLayout, LayoutContainer, Styles, TextButton, TextButtonOptions } from "phaser-ui-components";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'multiplayer-hud-scene'
};

export class MultiplayerHudScene extends Phaser.Scene implements Resizable {
    private _width: number;
    private _height: number;
    private _hudText: Phaser.GameObjects.Text;
    private _quitContainer: LayoutContainer;
    private _destructButton: TextButton;
    private _cancelDestructButton: TextButton;
    private _hudLayout: GridLayout;
    private _controller: InputController;
    private _connectedToServer: boolean;

    debug: boolean;

    constructor(settingsConfig?: Phaser.Types.Scenes.SettingsConfig) {
        super(settingsConfig || sceneConfig);

        this.debug = SpaceSim.debug;
    }

    create(): void {
        this.resize();
        GameScoreTracker.start(SpaceSimClient.player.config);
    }

    resize(): void {
        this._width = this.game.canvas.width;
        this._height = this.game.canvas.height;

        this.cameras.main.centerOn(0, 0);

        this._createHUD();
        this._createController();
    }

    update(time: number, delta: number): void {
        this._connectedToServer = SpaceSimClient.socket?.connected ?? false;
        this._displayHUDInfo();
        if (SpaceSimClient.player?.active) {
            this._controller?.update(time, delta);
        }
    }

    private _createHUD(): void {
        if (this._hudText) {
            this._hudText.destroy();
        }
        this._hudText = this.make.text({
            text: '', 
            style: { font: '14px Courier', color: '#ffff00' }
        }, false);

        if (this._quitContainer) {
            this._quitContainer.destroy();
        }
        this._quitContainer = new LayoutContainer(this, {
            padding: 5,
            backgroundStyles: Styles.dark().graphics,
            cornerRadius: 5
        });

        if (this._destructButton) {
            this._destructButton.destroy();
        }
        this._destructButton = new TextButton(this, TextButtonOptions.Outline.warning({
            textConfig: {text: 'SELF DESTRUCT'},
            padding: 5,
            cornerRadius: 5,
            onHover: () => {
                this._destructButton.setText({style: Styles.warning().text})
                    .setBackground(Styles.warning().graphics);
            },
            onClick: () => {
                SpaceSimClient.player.selfDestruct();
                this._quitContainer.removeContent(false);
                this._cancelDestructButton.setActive(true)
                    .setVisible(true);
                this._quitContainer.setContent(this._cancelDestructButton);
                this._destructButton.setActive(false)
                    .setVisible(false);
            }
        }));

        if (this._cancelDestructButton) {
            this._cancelDestructButton.destroy();
        }
        this._cancelDestructButton = new TextButton(this, TextButtonOptions.Outline.danger({
            textConfig: {text: 'CANCEL'},
            padding: 5,
            cornerRadius: 5,
            onHover: () => {
                this._cancelDestructButton.setText({style: Styles.danger().text})
                    .setBackground(Styles.danger().graphics);
            },
            onClick: () => {
                SpaceSimClient.player.cancelSelfDestruct();
                this._quitContainer.removeContent(false);
                this._destructButton.setActive(true)
                    .setVisible(true);
                this._quitContainer.setContent(this._destructButton);
                this._cancelDestructButton.setActive(false)
                    .setVisible(false);
            }
        })).setActive(false).setVisible(false);

        this._quitContainer.setContent(this._destructButton);

        const rows = Math.floor(this._height / 150);
        const cols = Math.floor(this._width / 150);
        if (this._hudLayout) {
            this._hudLayout.destroy();
        }
        this._hudLayout = new GridLayout(this, {
            height: this._height,
            width: this._width,
            rows: rows,
            columns: cols,
            padding: 5,
            alignment: {vertical: 'top'}
        }).addContentAt(0, 0, this._hudText)
        .addContentAt(0, cols-1, this._quitContainer) // quit button
        .setDepth(Constants.UI.Layers.HUD);
        this.add.existing(this._hudLayout);
    }

    private _createController(): void {
        if (this._controller) {
            this._controller.getGameObject()?.destroy();
        }
        if (this.game.device.os.desktop) {
            this._controller = new KbmController(this, SpaceSimClient.player);
        } else {
            this._controller = new TouchController(this, SpaceSimClient.player);
        }
        const obj = this._controller.getGameObject();
        if (obj) {
            this.add.existing(obj);
        }
    }

    private _displayHUDInfo(): void {
        try {
            const stats: GameStats = GameScoreTracker.getStats(SpaceSimClient.player.id);
            const info: string[] = [
                `Kills: ${GameScoreTracker.destroyedCount(SpaceSimClient.player.id)}`,
                `Active Players: ${SpaceSim.players()?.length}`,
                `Accuracy: ${stats.accuracy.toFixed(0)}%`,
                `Fuel: ${SpaceSimClient.player.getRemainingFuel().toFixed(1)}`,
                `Ammo: ${SpaceSimClient.player.getWeapons()?.remainingAmmo || 0}`,
                `Score: ${GameScoreTracker.getScore(SpaceSimClient.player.id).toFixed(0)}`
            ];
            if (SpaceSim.debug) {
                const loc: Phaser.Math.Vector2 = SpaceSimClient.player.getLocation();
                info.push(`Location: ${loc.x.toFixed(1)},${loc.y.toFixed(1)}`);
            }
            if (!this._connectedToServer) {
                info.push('SERVER DISCONNECTED!');
            }
            this._hudText.setText(info);
            this._hudLayout.updateSize(this._width, this._height);
        } catch (e) {
            // do nothing
        }
    }
}