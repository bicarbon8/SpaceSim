import { ShipPod } from "../ships/ship-pod";
import { InputController } from "./input-controller";
import { Globals } from "./globals";
import { Helpers } from "./helpers";
import { TouchTracker } from "./touch-tracker";

export class TouchController extends InputController {
    private _leftStick: Phaser.GameObjects.GameObject;
    private _touchTracker: TouchTracker;
    
    constructor(scene: Phaser.Scene, player?: ShipPod) {
        super(scene, player);

        this._createGameObject();

        this._touchTracker = new TouchTracker(this.scene);
    }

    update(): void {

    }

    private _createGameObject(): void {
        let xPos: number = 60;
        let yPos: number = this.scene.game.canvas.height - 60;
        let radius: number = 50;
        this._leftStick = this.scene.add.circle(xPos, yPos, radius, 0xf0f0f0, 0.2);
        this.getGameObject().add(this._leftStick);
        let shape = new Phaser.Geom.Circle(xPos, yPos, radius);
        this._leftStick.setInteractive(shape, (hitArea: any, x: number, y: number, gameObj: Phaser.GameObjects.GameObject) => {
            this._handleAimTouch(hitArea, x, y, gameObj);
        });
    }

    /**
     * function updates the location of the target based on where the receiving GameObject received a touch action
     * @param hitArea the Shape used to define valid touch areas of the GameObject
     * @param x the x location of the touch
     * @param y the y location of the touch
     * @param gameObj the GameObject that received the touch event
     */
    private _handleAimTouch(hitArea: any, x: number, y: number, gameObj: Phaser.GameObjects.GameObject): void {
        console.info(`handling touch at: ${x}, ${y}`);
        this._touchTracker.setLocation(Helpers.vector2(x, y));
    }
}