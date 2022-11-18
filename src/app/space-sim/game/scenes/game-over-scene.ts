import { FlexLayout, LinearLayout, TextButton } from "phaser-ui-components";
import { environment } from "src/environments/environment";
import { SpaceSim } from "../space-sim";
import { Constants } from "../utilities/constants";
import { GameScoreTracker } from "../utilities/game-score-tracker";
import { GameStats } from "../utilities/game-stats";

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
        this._stars.setDepth(Constants.DEPTH_BACKGROUND);
    }

    private _createStellarBodies(): void {
        this._sun = this.add.sprite(0, 0, 'sun');
        this._sun.setOrigin(0.5);
        this._sun.setDepth(Constants.DEPTH_STELLAR);
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
        this._layout.setDepth(Constants.DEPTH_CONTROLS);
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
        const stats: GameStats = GameScoreTracker.getStats();
        let accuracy: number = (stats.shotsLanded / stats.shotsFired) * 100;
        if (isNaN(accuracy)) {
            accuracy = 0;
        }
        const scoreText: Phaser.GameObjects.Text = this.make.text({
            text: '', 
            style: {font: '30px Courier', color: '#ff8080', stroke: '#ff0000', strokeThickness: 4}
        }, false);
        scoreText.setText([
            `Score: ${GameScoreTracker.getScore().toFixed(0)}`,
            `Time: ${(stats.elapsed / 1000).toFixed(0)} sec.`,
            `Accuracy: ${accuracy.toFixed(0)}%`,
            `Enemies: ${stats.opponentsDestroyed}/${SpaceSim.opponents.length}`
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
            desiredWidth: 250,
            text: {text: 'Press to Restart', style: style},
            background: {fillStyle: {color: 0xff6060, alpha: 0.5}},
            padding: 5,
            cornerRadius: 10
        });
        restartButton.setDepth(Constants.DEPTH_CONTROLS);
        restartButton.setPosition(this._width-(restartButton.width/2)-5, this._height-restartButton.height);
        restartButton.setInteractive().on(Phaser.Input.Events.POINTER_DOWN, () => {
            this.game.scene.start('gameplay-scene');
            this._music.stop();
            this.game.scene.stop(this);
        }).on(Phaser.Input.Events.POINTER_OVER, () => {
            restartButton.setBackground({fillStyle: {color: 0x80ff80, alpha: 1}});
            restartButton.setText({style: {color: '8d8d8d'}});
        }).on(Phaser.Input.Events.POINTER_OUT, () => {
            restartButton.setBackground({fillStyle: {color: 0xff6060, alpha: 0.5}});
            restartButton.setText({style: style});
        });

        const returnToMenuButton: TextButton = new TextButton(this, {
            desiredWidth: 250,
            text: {text: 'Return to Menu', style: style},
            background: {fillStyle: {color: 0xff6060, alpha: 0.5}},
            padding: 5,
            cornerRadius: 10
        });
        returnToMenuButton.setDepth(Constants.DEPTH_CONTROLS);
        returnToMenuButton.setPosition((returnToMenuButton.width/2)+5, this._height-returnToMenuButton.height);
        returnToMenuButton.setInteractive().on(Phaser.Input.Events.POINTER_DOWN, () => {
            this.game.scene.start('startup-scene');
            this.game.scene.stop(this);
        }).on(Phaser.Input.Events.POINTER_OVER, () => {
            returnToMenuButton.setBackground({fillStyle: {color: 0x80ff80, alpha: 1}});
            returnToMenuButton.setText({style: {color: '8d8d8d'}});
        }).on(Phaser.Input.Events.POINTER_OUT, () => {
            returnToMenuButton.setBackground({fillStyle: {color: 0xff6060, alpha: 0.5}});
            returnToMenuButton.setText({style: style});
        });

        const flex = new FlexLayout(this, {
            width: this._width,
            padding: 10,
            contents: [
                restartButton,
                returnToMenuButton
            ]
        });
        this._layout.addContents(flex);
    }

    private _createMusic(): void {
        this._music = this.sound.add('game-over-song', {loop: true, volume: 0.1});
        this._music.play();
        this.events.on(Phaser.Scenes.Events.PAUSE, () => this._music.pause());
        this.events.on(Phaser.Scenes.Events.RESUME, () => this._music.resume());
        this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => this._music.stop());
        this.events.on(Phaser.Scenes.Events.DESTROY, () => this._music.destroy());
    }
}