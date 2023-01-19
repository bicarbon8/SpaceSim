import { Helpers, Constants, Ship } from "space-sim-shared";
import { InputController } from "./input-controller";
import { GridLayout, LayoutContent, TextButton } from "phaser-ui-components";
import { SpaceSimClient } from "../space-sim-client";

export class TouchController extends InputController {
    private _mainContainer: GridLayout;
    private _fireButtonActive: boolean;
    private _thrusterButtonActive: boolean;
    private _throwButtonActive: boolean;
    private _boostButtonActive: boolean;

    private _engineStateChanged: boolean = false;
    private _weaponStateChanged: boolean = false;
    
    constructor(scene: Phaser.Scene, player?: Ship) {
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
        const pos: Phaser.Math.Vector2 = Helpers.vector2(x, y).subtract(Helpers.vector2(60));
        const radians: number = Phaser.Math.Angle.BetweenPoints(pos, Helpers.vector2());
        const degrees: number = +Helpers.rad2deg(radians).toFixed(0);
        // Helpers.log('info', `handling aim touch at: ${x}, ${y}; using ${pos.x}, ${pos.y} and angle: ${degrees}`);
        // only update if angle changed more than minimum allowed degrees
        if (!Phaser.Math.Fuzzy.Equal(this.ship.angle, degrees, Constants.Ship.MIN_ROTATION_ANGLE)) {
            SpaceSimClient.socket?.sendSetShipAngleRequest(degrees, SpaceSimClient.playerData);
            this.ship.setRotation(degrees);
        }
    }

    private _handleFireTouch(): void {
        if (this._fireButtonActive) {
            if (!this.ship.weapon.enabled) {
                this._weaponStateChanged = true;
                this.ship.weapon?.setEnabled(true);
            }
        } else {
            if (this.ship.weapon.enabled) {
                this._weaponStateChanged = true;
                this.ship.weapon?.setEnabled(false);
            }
        }
        if (this._weaponStateChanged) {
            this._weaponStateChanged = false;
            if (this.ship?.weapon?.enabled) {
                SpaceSimClient.socket?.sendEnableWeaponRequest(SpaceSimClient.playerData);
            } else {
                SpaceSimClient.socket?.sendDisableWeaponRequest(SpaceSimClient.playerData);
            }
        }
    }

    private _handleThrusterTouch(): void {
        if (this._thrusterButtonActive) {
            if (!this.ship.engine.enabled) {
                this._engineStateChanged = true;
                this.ship.engine?.setEnabled(true);
            }
        } else {
            if (this.ship.engine.enabled) {
                this._engineStateChanged = true;
                this.ship.engine?.setEnabled(false);
            }
        }
        if (this._engineStateChanged) {
            this._engineStateChanged = false;
            if (this.ship?.engine?.enabled) {
                SpaceSimClient.socket?.sendEnableEngineRequest(SpaceSimClient.playerData);
            } else {
                SpaceSimClient.socket?.sendDisableEngineRequest(SpaceSimClient.playerData);
            }
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
        const rows = Math.floor(height / 150);
        const cols = Math.floor(width / 150);
        this._mainContainer = new GridLayout(this.scene, {
            width: width,
            height: height,
            rows: rows,
            columns: cols,
            padding: 10,
        }).addContentAt(rows-1, 0, this._createLeftStick())
        .addContentAt(rows-1, cols-1, new GridLayout(this.scene, {
            width: 150,
            height: 150,
            rows: 3,
            columns: 3,
            contents: [
                [,this._createThrowButton(),],
                [this._createFireButton(),,this._createBoostButton()],
                [,this._createThrusterButton(),]
            ]
        })).setDepth(Constants.UI.Layers.HUD);
        this.scene.input.addPointer(9); // maximum input handling (10 total)
    }

    private _createLeftStick(): LayoutContent {
        const radius: number = 60;
        const leftStick: Phaser.GameObjects.Arc = this.scene.add.circle(0, 0, radius, 0xf0f0f0, 0.2)
            .setStrokeStyle(2, 0xffffff)
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
        const throwButton = new TextButton(this.scene, {
            width: 50,
            height: 50,
            cornerRadius: 25,
            textConfig: {text: 'Y', style: {color: '#ffff00'}},
            backgroundStyles: {fillStyle: {color: 0x000000, alpha: 0.3}, lineStyle: {color: 0xffff00, width: 2}},
            onClick: () => {
                throwButton.setText({style: {color: '#000000'}})
                    .setBackground({fillStyle: {color: 0xffff00}});
                this._throwButtonActive = true;
            }
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
        const boostButton = new TextButton(this.scene, {
            width: 50,
            height: 50,
            cornerRadius: 25,
            textConfig: {text: 'B', style: {color: '#ff0000'}},
            backgroundStyles: {fillStyle: {color: 0x000000, alpha: 0.3}, lineStyle: {color: 0xff0000, width: 2}},
            onClick: () => {
                boostButton.setText({style: {color: '#000000'}})
                    .setBackground({fillStyle: {color: 0xff0000}});
                this._boostButtonActive = true;
            }
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
        const thrusterButton = new TextButton(this.scene, {
            width: 50,
            height: 50,
            cornerRadius: 25,
            textConfig: {text: 'A', style: {color: '#00ff00'}},
            backgroundStyles: {fillStyle: {color: 0x000000, alpha: 0.3}, lineStyle: {color: 0x00ff00, width: 2}},
            onClick: () => {
                thrusterButton.setText({style: {color: '#000000'}})
                    .setBackground({fillStyle: {color: 0x00ff00}});
                this._thrusterButtonActive = true;
            }
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
        const fireButton = new TextButton(this.scene, {
            width: 50,
            height: 50,
            cornerRadius: 25,
            textConfig: {text: 'X', style: {color: '#0000ff'}},
            backgroundStyles: {fillStyle: {color: 0x000000, alpha: 0.3}, lineStyle: {color: 0x0000ff, width: 2}},
            onClick: () => {
                fireButton.setText({style: {color: '#ffffff'}})
                    .setBackground({fillStyle: {color: 0x0000ff}});
                this._fireButtonActive = true;
            }
        }).on(Phaser.Input.Events.POINTER_UP, () => {
            this._fireButtonActive = false;
        }).on(Phaser.Input.Events.POINTER_OUT, () => {
            this._fireButtonActive = false;
        });
        return fireButton;
    }
}