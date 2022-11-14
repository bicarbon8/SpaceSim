import { ShipPod } from "../ships/ship-pod";
import { InputController } from "./input-controller";
import { Helpers } from "../utilities/helpers";
import { AttachmentLocation } from "../ships/attachments/attachment-location";
import { Constants } from "../utilities/constants";

export class TouchController extends InputController {
    private _container: Phaser.GameObjects.Container;
    private _fireButtonActive: boolean;
    private _thrusterButtonActive: boolean;
    private _throwButtonActive: boolean;
    private _boostButtonActive: boolean;
    
    constructor(scene: Phaser.Scene, player?: ShipPod) {
        super(scene, player);

        this._createGameObj();
    }

    update(time: number, delta: number): void {
        this._handleFireTouch();
        this._handleThrusterTouch();
        this._handleThrowTouch();
        this._handleBoostTouch();
    }

    /**
     * @param x the x location of the touch
     * @param y the y location of the touch
     */
    private _handleAimTouch(x: number, y: number): void {
        let pos: Phaser.Math.Vector2 = Helpers.vector2(x, y).subtract(Helpers.vector2(40));
        let radians: number = Phaser.Math.Angle.BetweenPoints(pos, Helpers.vector2());
        let degrees: number = Helpers.rad2deg(radians);
        // console.info(`handling aim touch at: ${x}, ${y}; using ${pos.x}, ${pos.y} and angle: ${degrees}`);
        this.player.setRotation(degrees);
    }

    private _handleFireTouch(): void {
        if (this._fireButtonActive) {
            this.player.attachments.getAttachmentAt(AttachmentLocation.front)?.trigger();
        }
    }

    private _handleThrusterTouch(): void {
        if (this._thrusterButtonActive) {
            this.player.getThruster()?.thrustFowards();
        }
    }

    private _handleThrowTouch(): void {
        if (this._throwButtonActive) {
            // this.player.attachments.throwAttachmentAt(AttachmentLocation.front);
        }
    }

    private _handleBoostTouch(): void {
        if (this._boostButtonActive) {
            this.player.getThruster()?.boostForwards();
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
        this._container.setDepth(Constants.DEPTH_CONTROLS);
        this.scene.input.addPointer(9); // maximum input handling (10 total)

        this._createLeftStick();
        this._createThrowButton();
        this._createBoostButton();
        this._createThrusterButton();
        this._createFireButton();
    }

    private _createLeftStick(): void {
        const xPos: number = 75;
        const yPos: number = this.scene.game.canvas.height - 75;
        const radius: number = 40;
        const leftStick: Phaser.GameObjects.Arc = this.scene.add.circle(xPos, yPos, radius, 0xf0f0f0, 0.2);
        leftStick.setInteractive().on(Phaser.Input.Events.POINTER_MOVE, (pointer: Phaser.Input.Pointer, localX: number, localY: number, event: any) => {
            if (pointer.isDown) {
                this._handleAimTouch(localX, localY);
            }
        }).on(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer, localX: number, localY: number, event: any) => {
            this._handleAimTouch(localX, localY);
        }).on(Phaser.Input.Events.POINTER_OVER, (pointer: Phaser.Input.Pointer, localX: number, localY: number, event: any) => {
            if (pointer.isDown) {
                this._handleAimTouch(localX, localY);
            }
        });
        this.getGameObject().add(leftStick);
    }

    /**
     * YELLOW / TOP button (Y)
     */
    private _createThrowButton(): void {
        const xPos: number = this.scene.game.canvas.width - 75;
        const yPos: number = this.scene.game.canvas.height - 115;
        const radius: number = 20;
        const throwButton: Phaser.GameObjects.Arc = this.scene.add.circle(xPos, yPos, radius, 0xffff00, 0.2);
        throwButton.setInteractive().on(Phaser.Input.Events.POINTER_DOWN, () => {
            this._throwButtonActive = true;
        }).on(Phaser.Input.Events.POINTER_UP, () => {
            this._throwButtonActive = false;
        }).on(Phaser.Input.Events.POINTER_OUT, () => {
            this._throwButtonActive = false;
        });
        this.getGameObject().add(throwButton);
    }

    /**
     * RED / RIGHT button (B)
     */
    private _createBoostButton(): void {
        const xPos: number = this.scene.game.canvas.width - 35;
        const yPos: number = this.scene.game.canvas.height - 75;
        const radius: number = 20;
        const boostButton: Phaser.GameObjects.Arc = this.scene.add.circle(xPos, yPos, radius, 0xff0000, 0.2);
        boostButton.setInteractive().on(Phaser.Input.Events.POINTER_DOWN, () => {
            this._boostButtonActive = true;
        }).on(Phaser.Input.Events.POINTER_UP, () => {
            this._boostButtonActive = false;
        }).on(Phaser.Input.Events.POINTER_OUT, () => {
            this._boostButtonActive = false;
        });
        this.getGameObject().add(boostButton);
    }

    /**
     * GREEN / BOTTOM button (A)
     */
    private _createThrusterButton(): void {
        const xPos: number = this.scene.game.canvas.width - 75;
        const yPos: number = this.scene.game.canvas.height - 35;
        const radius: number = 20;
        const thrusterButton: Phaser.GameObjects.Arc = this.scene.add.circle(xPos, yPos, radius, 0x00ff00, 0.2);
        thrusterButton.setInteractive().on(Phaser.Input.Events.POINTER_DOWN, () => {
            this._thrusterButtonActive = true;
        }).on(Phaser.Input.Events.POINTER_UP, () => {
            this._thrusterButtonActive = false;
        }).on(Phaser.Input.Events.POINTER_OUT, () => {
            this._thrusterButtonActive = false;
        });
        this.getGameObject().add(thrusterButton);
    }

    /**
     * BLUE / LEFT button (X)
     */
    private _createFireButton(): void {
        let xPos: number = this.scene.game.canvas.width - 115;
        let yPos: number = this.scene.game.canvas.height - 75;
        let radius: number = 20;
        const fireButton: Phaser.GameObjects.Arc = this.scene.add.circle(xPos, yPos, radius, 0x0000ff, 0.2);
        fireButton.setInteractive().on(Phaser.Input.Events.POINTER_DOWN, () => {
            this._fireButtonActive = true;
        }).on(Phaser.Input.Events.POINTER_UP, () => {
            this._fireButtonActive = false;
        }).on(Phaser.Input.Events.POINTER_OUT, () => {
            this._fireButtonActive = false;
        });
        this.getGameObject().add(fireButton);
    }
}