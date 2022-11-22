import { ShipPod } from "../ships/ship-pod";
import { InputController } from "./input-controller";
import { Helpers } from "../utilities/helpers";
import { AttachmentLocation } from "../ships/attachments/attachment-location";
import { Constants } from "../utilities/constants";
import { GridLayout, LayoutContent } from "phaser-ui-components";

export class TouchController extends InputController {
    private _mainContainer: GridLayout;
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
            this.player.getThruster()?.trigger();
        }
    }

    private _handleThrowTouch(): void {
        if (this._throwButtonActive) {
            // this.player.attachments.throwAttachmentAt(AttachmentLocation.front);
        }
    }

    private _handleBoostTouch(): void {
        if (this._boostButtonActive) {
            // this.player.getThruster()?.boostForwards();
        }
    }

    getGameObject(): Phaser.GameObjects.Container {
        return this._mainContainer;
    }

    getPhysicsBody(): Phaser.Physics.Arcade.Body {
        return null;
    }

    private _createGameObj(): void {
        const width = this.scene.sys.game.scale.gameSize.width;
        const height = this.scene.sys.game.scale.gameSize.height;
        const rows = Math.floor(height / 100);
        const cols = Math.floor(width / 100);
        this._mainContainer = new GridLayout(this.scene, {
            width: width,
            height: height,
            rows: rows,
            columns: cols,
            padding: 10,
        }).addContentAt(rows-1, 0, this._createLeftStick())
        .addContentAt(rows-1, cols-1, new GridLayout(this.scene, {
            width: 100,
            height: 100,
            rows: 3,
            columns: 3,
            contents: [
                [,this._createThrowButton(),],
                [this._createFireButton(),,this._createBoostButton()],
                [,this._createThrusterButton(),]
            ]
        })).setDepth(Constants.DEPTH_CONTROLS);
        this.scene.input.addPointer(9); // maximum input handling (10 total)
    }

    private _createLeftStick(): LayoutContent {
        const radius: number = 40;
        const leftStick: Phaser.GameObjects.Arc = this.scene.add.circle(0, 0, radius, 0xf0f0f0, 0.2)
            .setInteractive().on(Phaser.Input.Events.POINTER_MOVE, (pointer: Phaser.Input.Pointer, localX: number, localY: number, event: any) => {
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
        return leftStick;
    }

    /**
     * YELLOW / TOP button (Y)
     */
    private _createThrowButton(): LayoutContent {
        const radius: number = 20;
        const throwButton: Phaser.GameObjects.Arc = this.scene.add.circle(0, 0, radius, 0xffff00, 0.2)
            .setInteractive().on(Phaser.Input.Events.POINTER_DOWN, () => {
                this._throwButtonActive = true;
            }).on(Phaser.Input.Events.POINTER_UP, () => {
                this._throwButtonActive = false;
            }).on(Phaser.Input.Events.POINTER_OUT, () => {
                this._throwButtonActive = false;
            });
        return throwButton;
    }

    /**
     * RED / RIGHT button (B)
     */
    private _createBoostButton(): LayoutContent {
        const radius: number = 20;
        const boostButton: Phaser.GameObjects.Arc = this.scene.add.circle(0, 0, radius, 0xff0000, 0.2)
            .setInteractive().on(Phaser.Input.Events.POINTER_DOWN, () => {
                this._boostButtonActive = true;
            }).on(Phaser.Input.Events.POINTER_UP, () => {
                this._boostButtonActive = false;
            }).on(Phaser.Input.Events.POINTER_OUT, () => {
                this._boostButtonActive = false;
            });
        return boostButton;
    }

    /**
     * GREEN / BOTTOM button (A)
     */
    private _createThrusterButton(): LayoutContent {
        const radius: number = 20;
        const thrusterButton: Phaser.GameObjects.Arc = this.scene.add.circle(0, 0, radius, 0x00ff00, 0.2)
            .setInteractive().on(Phaser.Input.Events.POINTER_DOWN, () => {
                this._thrusterButtonActive = true;
            }).on(Phaser.Input.Events.POINTER_UP, () => {
                this._thrusterButtonActive = false;
            }).on(Phaser.Input.Events.POINTER_OUT, () => {
                this._thrusterButtonActive = false;
            });
        return thrusterButton;
    }

    /**
     * BLUE / LEFT button (X)
     */
    private _createFireButton(): LayoutContent {
        const radius: number = 20;
        const fireButton: Phaser.GameObjects.Arc = this.scene.add.circle(0, 0, radius, 0x0000ff, 0.2)
            .setInteractive().on(Phaser.Input.Events.POINTER_DOWN, () => {
                this._fireButtonActive = true;
            }).on(Phaser.Input.Events.POINTER_UP, () => {
                this._fireButtonActive = false;
            }).on(Phaser.Input.Events.POINTER_OUT, () => {
                this._fireButtonActive = false;
            });
        return fireButton;
    }
}