import { environment } from "src/environments/environment";
import { SpaceSim } from "../space-sim";
import { TextButton } from "../ui/text-button";
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
    private _gameOverSong: Phaser.Sound.BaseSound;
    
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

        this._createBackground();
        this._createStellarBodies();
        this._createScore();
        this._createTitle();
        this._createMenuItems();
        this._createBackgroundMusic();
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
        this._stars = this.add.tileSprite(this._width/2, this._height/2, this._width*3, this._height*3, 'far-stars');
        this._stars.setDepth(Constants.DEPTH_BACKGROUND);
    }

    private _createStellarBodies(): void {
        this._sun = this.add.sprite(this._width / 2, this._height / 2, 'sun');
        this._sun.setDepth(Constants.DEPTH_STELLAR);
        const smallestDimension: number = (this._width <= this._height) ? this._width : this._height;
        const sunRadius: number = this._sun.width/2;
        const sunScaleFactor: number = smallestDimension / sunRadius;
        this._sun.setScale(sunScaleFactor);
    }

    private _createScore(): void {
        const scoreText: Phaser.GameObjects.Text = this.add.text(0, 0, ``, {font: '30px Courier', color: '#ff8080', stroke: '#ff0000', strokeThickness: 4});
        const stats: GameStats = GameScoreTracker.getStats();
        let accuracy: number = (stats.shotsLanded / stats.shotsFired) * 100;
        if (isNaN(accuracy)) {
            accuracy = 0;
        }
        scoreText.setText([
            `Score: ${GameScoreTracker.getScore().toFixed(0)}`,
            `Time: ${(stats.elapsed / 1000).toFixed(0)} sec.`,
            `Accuracy: ${accuracy.toFixed(0)}%`,
            `Enemies: ${stats.opponentsDestroyed}/${SpaceSim.opponents.length}`
        ]);
        scoreText.setDepth(Constants.DEPTH_CONTROLS);
        scoreText.setX((this._width/2)-(scoreText.width/2));
        scoreText.setY((this._height/2)-(scoreText.height/2));
    }

    private _createTitle(): void {
        const titleText: Phaser.GameObjects.Text = this.add.text(0, 0, 'GAME OVER', {font: '40px Courier', color: '#ff8080', stroke: '#ff0000', strokeThickness: 4});
        titleText.setDepth(Constants.DEPTH_CONTROLS);
        titleText.setX((this._width/2)-(titleText.width/2));
        titleText.setY(5);
    }

    private _createMenuItems(): void {
        const style = { 
            font: '20px Courier', 
            color: '#ddffdd',
            align: 'center'
        };

        const restartButton: TextButton = new TextButton({
            scene: this,
            x: 0,
            y: 0,
            text: 'Press to Restart',
            textStyle: style,
            colour: 0xff6060,
            alpha: 0.5,
            padding: 5,
            cornerRadius: 5
        });
        restartButton.setDepth(Constants.DEPTH_CONTROLS);
        restartButton.setPosition(this._width-(restartButton.width/2)-5, this._height-restartButton.height);
        restartButton.setInteractive().on(Phaser.Input.Events.POINTER_DOWN, () => {
            this.game.scene.start('gameplay-scene');
            this._gameOverSong.stop();
            this.game.scene.stop(this);
        }).on(Phaser.Input.Events.POINTER_OVER, () => {
            restartButton.setButtonColor(0x80ff80, 1);
            restartButton.setTextStyle({color: '8d8d8d'});
        }).on(Phaser.Input.Events.POINTER_OUT, () => {
            restartButton.setButtonColor(0xff6060, 0.5);
            restartButton.setTextStyle(style);
        });

        const returnToMenuButton: TextButton = new TextButton({
            scene: this,
            x: 0,
            y: 0,
            text: 'Return to Menu',
            textStyle: style,
            colour: 0xff6060,
            alpha: 0.5,
            padding: 5,
            cornerRadius: 5
        });
        returnToMenuButton.setDepth(Constants.DEPTH_CONTROLS);
        returnToMenuButton.setPosition((returnToMenuButton.width/2)+5, this._height-returnToMenuButton.height);
        returnToMenuButton.setInteractive().on(Phaser.Input.Events.POINTER_DOWN, () => {
            this.game.scene.start('startup-scene');
            this._gameOverSong.stop();
            this.game.scene.stop(this);
        }).on(Phaser.Input.Events.POINTER_OVER, () => {
            returnToMenuButton.setButtonColor(0x80ff80, 1);
            returnToMenuButton.setTextStyle({color: '8d8d8d'});
        }).on(Phaser.Input.Events.POINTER_OUT, () => {
            returnToMenuButton.setButtonColor(0xff6060, 0.5);
            returnToMenuButton.setTextStyle(style);
        });
    }

    private _createBackgroundMusic(): void {
        this._gameOverSong = this.sound.add('game-over-song', {loop: true, volume: 0.1});
        this._gameOverSong.play();
    }
}