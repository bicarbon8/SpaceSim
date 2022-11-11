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
        this._hudText = this.add.text(10, 10, '', { font: '12px Courier', color: '#ffdddd' });
        this._hudText.setScrollFactor(0); // keep fixed in original location on screen
        this._hudText.setDepth(Constants.DEPTH_HUD);

        if (this._scoreText) {
            this._scoreText.destroy();
        }
        this._scoreText = this.add.text(0, 0, 'SAMPLE TEXT', {font: '20px Courier', color: '#808080', stroke: '#ffff00', strokeThickness: 4});
        this._scoreText.setDepth(Constants.DEPTH_CONTROLS);
        this._scoreText.setX((this._width/2)-(this._scoreText.width/2));
        this._scoreText.setY(this._scoreText.height);
        this._scoreText.setScrollFactor(0); // keep fixed in original location on screen
        this._scoreText.setDepth(Constants.DEPTH_HUD);
    }

    private _createController(): void {
        if (this._controller) {
            (this._controller as TouchController)?.getGameObject()?.destroy();
        }
        if (this.game.device.os.desktop) {
            this._controller = new KbmController(this, SpaceSim.player);
        } else {
            this._controller = new TouchController(this, SpaceSim.player);
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
        } catch (e) {
            // do nothing
        }
    }
}