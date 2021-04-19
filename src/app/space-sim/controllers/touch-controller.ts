import { ShipPod } from "../ships/ship-pod";
import { InputController } from "./input-controller";
import { Helpers } from "../utilities/helpers";
import { AttachmentLocation } from "../ships/attachments/attachment-location";
import { ShipAttachment } from "../ships/attachments/ship-attachment";
import { HasGameObject } from "../interfaces/has-game-object";

export class TouchController extends InputController implements HasGameObject<Phaser.GameObjects.Container> {
    private _container: Phaser.GameObjects.Container;
    private _leftStick: Phaser.GameObjects.Arc;
    private _topButton: Phaser.GameObjects.Arc;
    private _topButtonActive: boolean;
    private _bottomButton: Phaser.GameObjects.Arc;
    private _bottomButtonActive: boolean;
    
    constructor(scene: Phaser.Scene, player?: ShipPod) {
        super(scene, player);

        this._createGameObj();
    }

    update(time: number, delta: number): void {
        this._handleFireTouch();
        this._handleThrusterTouch();
    }

    /**
     * function updates the location of the target based on where the receiving GameObject received a touch action
     * @param hitArea the Shape used to define valid touch areas of the GameObject
     * @param x the x location of the touch
     * @param y the y location of the touch
     * @param gameObj the GameObject that received the touch event
     */
    private _handleAimTouch(x: number, y: number): void {
        let pos: Phaser.Math.Vector2 = Helpers.vector2(x, y).subtract(Helpers.vector2(40));
        let radians: number = Phaser.Math.Angle.BetweenPoints(pos, Helpers.vector2());
        let degrees: number = Helpers.rad2deg(radians);
        // console.info(`handling aim touch at: ${x}, ${y}; using ${pos.x}, ${pos.y} and angle: ${degrees}`);
        this.player.setRotation(degrees);
    }

    /**
     * triggers firing of the weapon located in the {AttachmentLocation.front} position
     * @param hitArea the Shape used to define valid touch areas of the GameObject
     * @param x the x location of the touch
     * @param y the y location of the touch
     * @param gameObj the GameObject that received the touch event
     */
    private _handleFireTouch(): void {
        if (this._topButtonActive) {
            let att: ShipAttachment = this.player.attachments.getAttachmentAt(AttachmentLocation.front);
            if (att) {
                att.trigger();
            }
        }
    }

    /**
     * triggers the ship's thruster
     * @param hitArea the Shape used to define valid touch areas of the GameObject
     * @param x the x location of the touch
     * @param y the y location of the touch
     * @param gameObj the GameObject that received the touch event
     */
    private _handleThrusterTouch(): void {
        if (this._bottomButtonActive) {
            this.player.getThruster()?.thrustFowards();
        }
    }

    getGameObject(): Phaser.GameObjects.Container {
        return this._container;
    }

    getPhysicsBody(): Phaser.Physics.Arcade.Body {
        return null;
    }

    private _createGameObj(): void {
        this._container = this.scene.add.container();

        this._createLeftStick();
        this._createTopButton();
        this._createBottomButton();
    }

    private _createLeftStick(): void {
        let xPos: number = 50;
        let yPos: number = this.scene.game.canvas.height - 50;
        let radius: number = 40;
        this._leftStick = this.scene.add.circle(xPos, yPos, radius, 0xf0f0f0, 0.2);
        this.getGameObject().add(this._leftStick);
        this._leftStick.setInteractive().on(Phaser.Input.Events.POINTER_MOVE, (pointer: Phaser.Input.Pointer, localX: number, localY: number, event: any) => {
            this._handleAimTouch(localX, localY);
        }).on(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer, localX: number, localY: number, event: any) => {
            this._handleAimTouch(localX, localY);
        });
    }

    private _createTopButton(): void {
        let xPos: number = this.scene.game.canvas.width - 50;
        let yPos: number = this.scene.game.canvas.height - 75;
        let radius: number = 15;
        this._topButton = this.scene.add.circle(xPos, yPos, radius, 0xffff00, 0.2);
        this.getGameObject().add(this._topButton);
        this._topButton.setInteractive().on(Phaser.Input.Events.POINTER_DOWN, () => {
            this._topButtonActive = true;
        }).on(Phaser.Input.Events.POINTER_UP, () => {
            this._topButtonActive = false;
        });
    }

    private _createBottomButton(): void {
        let xPos: number = this.scene.game.canvas.width - 50;
        let yPos: number = this.scene.game.canvas.height - 25;
        let radius: number = 15;
        this._bottomButton = this.scene.add.circle(xPos, yPos, radius, 0x00ff00, 0.2);
        this.getGameObject().add(this._bottomButton);
        let shape = new Phaser.Geom.Circle(xPos, yPos, radius);
        this._bottomButton.setInteractive().on(Phaser.Input.Events.POINTER_DOWN, () => {
            this._bottomButtonActive = true;
        }).on(Phaser.Input.Events.POINTER_UP, () => {
            this._bottomButtonActive = false;
        });
    }
}