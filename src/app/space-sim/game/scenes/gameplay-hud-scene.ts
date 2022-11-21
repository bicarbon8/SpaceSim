import { Constants } from "../utilities/constants";
import { SpaceSim } from "../space-sim";
import { AttachmentLocation } from "../ships/attachments/attachment-location";
import { OffenceAttachment } from "../ships/attachments/offence/offence-attachment";
import { GameScoreTracker } from "../utilities/game-score-tracker";
import { GameStats } from "../utilities/game-stats";
import { InputController } from "../controllers/input-controller";
import { TouchController } from "../controllers/touch-controller";
import { KbmController } from "../controllers/kbm-controller";
import { Resizable } from "../interfaces/resizable";
import { GridLayout } from "phaser-ui-components";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'gameplay-hud-scene'
};

export class GameplayHudScene extends Phaser.Scene implements Resizable {
    private _width: number;
    private _height: number;
    private _hudText: Phaser.GameObjects.Text;
    private _scoreText: Phaser.GameObjects.Text;
    private _hudLayout: GridLayout;
    private _controller: InputController;

    debug: boolean;

    constructor(settingsConfig?: Phaser.Types.Scenes.SettingsConfig) {
        super(settingsConfig || sceneConfig);

        this.debug = SpaceSim.debug;
    }

    create(): void {
        this.resize();
        GameScoreTracker.start();
    }

    resize(): void {
        this._width = this.game.canvas.width;
        this._height = this.game.canvas.height;

        this.cameras.main.centerOn(0, 0);

        this._createHUD();
        this._createController();
    }

    update(time: number, delta: number): void {
        this._displayHUDInfo();
        this._controller?.update(time, delta);
    }

    private _createHUD(): void {
        if (this._hudText) {
            this._hudText.destroy();
        }
        this._hudText = this.make.text({
            text: '', 
            style: { font: '14px Courier', color: '#ffff00' }
        }, false);

        if (this._scoreText) {
            this._scoreText.destroy();
        }
        this._scoreText = this.make.text({
            text: '', 
            style: {font: '14px Courier', color: '#ffff00'}
        }, false);

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
        .addContentAt(0, cols-1, this._scoreText)
        .setDepth(Constants.DEPTH_CONTROLS);
        this.add.existing(this._hudLayout);
    }

    private _createController(): void {
        if (this._controller) {
            this._controller.getGameObject()?.destroy();
        }
        if (this.game.device.os.desktop) {
            this._controller = new KbmController(this, SpaceSim.player);
        } else {
            this._controller = new TouchController(this, SpaceSim.player);
        }
        const obj = this._controller.getGameObject();
        if (obj) {
            this.add.existing(obj);
        }
    }

    private _displayHUDInfo(): void {
        try {
            let loc: Phaser.Math.Vector2 = SpaceSim.player.getLocation();
            let info: string[] = [
                `Speed: ${SpaceSim.player.getSpeed().toFixed(1)}`,
                `Integrity: ${SpaceSim.player.getIntegrity().toFixed(1)}`,
                `Heat: ${SpaceSim.player.getTemperature().toFixed(1)}`,
                `Fuel: ${SpaceSim.player.getRemainingFuel().toFixed(1)}`,
                `Ammo: ${(SpaceSim.player.attachments.getAttachmentAt(AttachmentLocation.front) as OffenceAttachment)?.ammo || 0}`
            ];
            if (SpaceSim.debug) {
                info.push(`Location: ${loc.x.toFixed(1)},${loc.y.toFixed(1)}`);
            }
            this._hudText.setText(info);

            let stats: GameStats = GameScoreTracker.getStats();
            let score: string[] = [
                `Elapsed: ${(stats.elapsed/1000).toFixed(1)}`,
                `Enemies: ${stats.opponentsDestroyed}/${SpaceSim.opponents.length}`,
                `Score: ${GameScoreTracker.getScore().toFixed(0)}`
            ]
            this._scoreText.setText(score);

            this._hudLayout.updateSize(this._width, this._height);
        } catch (e) {
            // do nothing
        }
    }
}