import { FlexLayout, LinearLayout, TextButton } from "phaser-ui-components";
import { environment } from "src/environments/environment";
import { SpaceSimClient } from "../space-sim-client";
import { Constants, GameScoreTracker, GameStats, Helpers } from "space-sim-server";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'game-over-scene'
};

export class GameOverScene extends Phaser.Scene {
    private _width: number;
	private _height: number;
    private _sun: Phaser.GameObjects.Sprite;
    private _stars: Phaser.GameObjects.TileSprite;
    private _music: Phaser.Sound.BaseSound;
    private _layout: LinearLayout;
    
    constructor(settingsConfig?: Phaser.Types.Scenes.SettingsConfig) {
        super(settingsConfig || sceneConfig);
    }

    preload(): void {
        this.load.image('sun', `${environment.baseUrl}/assets/backgrounds/sun.png`);

        this.load.image('far-stars', `${environment.baseUrl}/assets/backgrounds/starfield-tile-512x512.png`);

        this.load.audio('game-over-song', `${environment.baseUrl}/assets/audio/space-ray.ogg`);
    }

    create(): void {
        SpaceSimClient.socket.on(Constants.Socket.UPDATE_STATS, (id: string, stats: Partial<GameStats>) => {
            GameScoreTracker.updateStats(id, stats);
        });
        this._width = this.game.canvas.width;
        this._height = this.game.canvas.height;

        this.cameras.main.centerOn(0, 0);

        this._createBackground();
        this._createStellarBodies();
        this._createLayout();
        this._createTitle();
        this._createScore();
        this._createMenuItems();
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
        this._stars.setDepth(Constants.UI.Layers.BACKGROUND);
    }

    private _createStellarBodies(): void {
        this._sun = this.add.sprite(0, 0, 'sun');
        this._sun.setOrigin(0.5);
        this._sun.setDepth(Constants.UI.Layers.STELLAR);
        const smallestDimension: number = (this._width <= this._height) ? this._width : this._height;
        const sunRadius: number = this._sun.width/2;
        const sunScaleFactor: number = smallestDimension / sunRadius;
        this._sun.setScale(sunScaleFactor);
    }

    private _createLayout(): void {
        this._layout = new LinearLayout(this, {
            orientation: 'vertical',
            padding: 10,
            desiredWidth: this._width,
            desiredHeight: this._height
        });
        this._layout.setDepth(Constants.UI.Layers.HUD);
        this.add.existing(this._layout);
    }

    private _createTitle(): void {
        const titleText: Phaser.GameObjects.Text = this.make.text({ 
            text: 'GAME OVER', 
            style: {font: '40px Courier', color: '#ff8080', stroke: '#ff0000', strokeThickness: 4}
        }, false);
        this._layout.addContents(titleText);
    }

    private _createScore(): void {
        const id = SpaceSimClient.player.id;
        const stats: GameStats = GameScoreTracker.getStats(id);
        const scoreText: Phaser.GameObjects.Text = this.make.text({
            text: '', 
            style: {font: '30px Courier', color: '#ff8080', stroke: '#ff0000', strokeThickness: 4}
        }, false);
        scoreText.setText([
            `Score: ${GameScoreTracker.getScore(id).toFixed(0)}`,
            `Time: ${(stats.elapsed / 1000).toFixed(0)} sec.`,
            `Accuracy: ${stats.accuracy.toFixed(0)}%`,
            `Kills: ${GameScoreTracker.destroyedCount(id)}`
        ]);
        this._layout.addContents(scoreText);
    }

    private _createMenuItems(): void {
        const style = { 
            font: '20px Courier', 
            color: '#ddffdd',
            align: 'center'
        };

        const restartButton: TextButton = new TextButton(this, {
            width: 250,
            textConfig: {text: 'Press to Restart', style: style},
            backgroundStyles: {fillStyle: {color: 0xff6060, alpha: 0.5}},
            padding: 5,
            cornerRadius: 10,
            onHover: () => {
                restartButton.setText({style: {color: '8d8d8d'}})
                    .setBackground({fillStyle: {color: 0x80ff80, alpha: 1}});
            },
            onClick: () => {
                switch (SpaceSimClient.mode) {
                    case 'singleplayer':
                        this.game.scene.start('gameplay-scene');
                        break;
                    case 'multiplayer':
                        this.game.scene.start('multiplayer-scene');
                        break;
                    default:
                        this.game.scene.start('startup-scene');
                        break;
                }
                this._music.stop();
                this.game.scene.stop(this);
            }
        });

        const returnToMenuButton: TextButton = new TextButton(this, {
            width: 250,
            textConfig: {text: 'Return to Menu', style: style},
            backgroundStyles: {fillStyle: {color: 0xff6060, alpha: 0.5}},
            padding: 5,
            cornerRadius: 10,
            onHover: () => {
                returnToMenuButton.setText({style: {color: '8d8d8d'}})
                    .setBackground({fillStyle: {color: 0x80ff80, alpha: 1}});
            },
            onClick: () => {
                this.game.scene.start('startup-scene');
                this.game.scene.stop(this);
            }
        });

        const flex = new FlexLayout(this, {
            width: this._width,
            padding: 10,
            contents: [
                restartButton,
                returnToMenuButton
            ]
        });
        flex.setDepth(Constants.UI.Layers.HUD);
        this._layout.addContents(flex);
    }

    private _createMusic(): void {
        Helpers.trycatch(() => this._music = this.sound.add('game-over-song', {loop: true, volume: 0.1}));
        this._music?.play();
        this.events.on(Phaser.Scenes.Events.PAUSE, () => this._music?.pause());
        this.events.on(Phaser.Scenes.Events.RESUME, () => this._music?.resume());
        this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => this._music?.stop());
        this.events.on(Phaser.Scenes.Events.DESTROY, () => this._music?.destroy());
    }
}