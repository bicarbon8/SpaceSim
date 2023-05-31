import { SpaceSim, BaseScene, Ship, InputController, Logging } from "space-sim-shared";
import { SpaceSimClient } from "../space-sim-client";
import { TouchController } from "../controllers/touch-controller";
import { KbmController } from "../controllers/kbm-controller";
import { Resizable } from "../interfaces/resizable";
import { GridLayout, LayoutContainer, Styles, TextButton, TextButtonOptions } from "phaser-ui-components";
import { MultiplayerSceneConfig } from "./multiplayer-scene";

export const MultiplayerHudSceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'multiplayer-hud-scene'
} as const;

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
    private _parentScene: BaseScene;

    debug: boolean;

    constructor(settingsConfig?: Phaser.Types.Scenes.SettingsConfig) {
        super(settingsConfig || MultiplayerHudSceneConfig);

        this.debug = SpaceSim.debug;
    }

    get parentScene(): BaseScene {
        return this._parentScene;
    }

    create(): void {
        this._parentScene = SpaceSim.game.scene.getScene(MultiplayerSceneConfig.key) as BaseScene;
        this.resize();
        SpaceSim.stats.start(this.playerShip.currentState);
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
        if (this.playerShip?.active) {
            this._controller?.update(time, delta);
        }
    }

    get playerShip(): Ship {
        return this._parentScene.getShip(SpaceSimClient.playerShipId);
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
                this.playerShip.selfDestruct();
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
                this.playerShip.cancelSelfDestruct();
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
        .setDepth(SpaceSimClient.Constants.UI.Layers.HUD);
        this.add.existing(this._hudLayout);
    }

    private _createController(): void {
        if (this.game.device.os.desktop) {
            this._controller = new KbmController(this);
        } else {
            if (this._controller) {
                (this._controller as TouchController).getGameObject()?.destroy();
            }
            const controller = new TouchController(this);
            this.add.existing(controller.getGameObject());
            this._controller = controller;
        }
        // handle events sent by the controller
        this.parentScene.events.on(SpaceSim.Constants.Events.ENGINE_ON, (id: string, enabled: boolean) => {
            SpaceSimClient.socket?.sendEngineOnRequest(enabled);
        }).on(SpaceSim.Constants.Events.WEAPON_FIRING, (id: string, firing: boolean) => {
            SpaceSimClient.socket?.sendWeaponFiringRequest(firing);
        }).on(SpaceSim.Constants.Events.SHIP_ANGLE, (id: string, degrees: number) => {
            SpaceSimClient.socket?.sendSetShipAngleRequest(degrees);
        });
    }

    private _displayHUDInfo(): void {
        try {
            const stats = SpaceSim.stats.getStats({shipId: this.playerShip.id});
            const info: string[] = [
                `Kills: ${stats.opponentsDestroyed.length}`,
                `Active Players: ${this._parentScene.getShips()?.length}`,
                `Accuracy: ${stats.accuracy.toFixed(0)}%`,
                `Fuel: ${this.playerShip.remainingFuel.toFixed(1)}`,
                `Ammo: ${this.playerShip.weapon.remainingAmmo || 0}`,
                `Score: ${SpaceSim.stats.getScore(this.playerShip.id).toFixed(0)}`
            ];
            if (Logging.shouldLog('debug')) {
                const loc = this.playerShip.location;
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