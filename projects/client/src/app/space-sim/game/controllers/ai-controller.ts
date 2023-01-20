import { BaseScene, Constants, DynamicGameObject, Helpers, Ship, SpaceSim } from "space-sim-shared";
import { PlayerShip } from "../ships/player-ship";
import { SpaceSimClient } from "../space-sim-client";
import { InputController } from "./input-controller";

export type AiState = 'patroling' | 'chasing' | 'searching' | 'attacking' | 'avoiding';

export class AiController extends InputController {
    private _container: Phaser.GameObjects.Container;
    private _lastKnownPlayerLocation: Phaser.Types.Math.Vector2Like;
    private _lastSawPlayerTime: number;
    private _nextWeaponsFireAt: number;
    private _nextThrusterFireAt: number;
    private _canCheckView: boolean;
    private _viewGeom: Phaser.Geom.Triangle;

    private _medPriUpdateAt: number = Constants.Timing.MED_PRI_UPDATE_FREQ;
    private _lowPriUpdateAt: number = Constants.Timing.LOW_PRI_UPDATE_FREQ;
    private _ultraLowPriUpdateAt: number = Constants.Timing.ULTRALOW_PRI_UPDATE_FREQ;
    
    private _state: AiState = 'patroling';

    constructor(scene: BaseScene, ship?: PlayerShip) {
        super(scene, ship);
    }

    override get scene(): BaseScene {
        return super.scene as BaseScene;
    }

    get state(): AiState {
        return this._state;
    }

    get view(): Phaser.Geom.Triangle {
        if (!this._viewGeom) {
            this._viewGeom = new Phaser.Geom.Triangle();
        }

        const viewDistance = 500;
        const heading = this.ship.heading;
        const origin = this.ship.location;
        const rightAnglePoint = Helpers.vector2(origin.x, origin.y)
            .add(heading.clone().multiply(Helpers.vector2(viewDistance)));
        const hypotenusePoint1 = rightAnglePoint.clone()
            .add(heading.clone().normalizeRightHand()
                .multiply(Helpers.vector2(viewDistance / 4)));
        const hypotenusePoint2 = rightAnglePoint.clone()
            .add(heading.clone().normalizeLeftHand()
                .multiply(Helpers.vector2(viewDistance / 4)));
        this._viewGeom.setTo(origin.x, origin.y, hypotenusePoint2.x, hypotenusePoint2.y, hypotenusePoint1.x, hypotenusePoint1.y);

        return this._viewGeom;
    }
    
    update(time: number, delta: number): void {
        this._medPriUpdateAt += delta;
        this._lowPriUpdateAt += delta;
        this._ultraLowPriUpdateAt += delta;

        if (this.ship.weapon.enabled) {
            this.ship.weapon.setEnabled(false);
        }
        if (this.ship.engine.enabled) {
            this.ship.engine.setEnabled(false);
        }

        this.ship.update(time, delta);
        
        if (this.ship.active) {
            const attacker = this._hasAttacker();
            if (attacker) {
                if (this.canSee(attacker.location)) {
                    this._setLastKnown(attacker);
                    this._attack(attacker);
                } else {
                    this._chase(attacker);
                }
            } else {
                this._patrol();
            }
        }

        if (this._medPriUpdateAt >= Constants.Timing.MED_PRI_UPDATE_FREQ) {
            this._medPriUpdateAt = 0;
        }
        if (this._lowPriUpdateAt >= Constants.Timing.LOW_PRI_UPDATE_FREQ) {
            this._lowPriUpdateAt = 0;
            this._canCheckView = true;
        }
        if (this._ultraLowPriUpdateAt >= Constants.Timing.ULTRALOW_PRI_UPDATE_FREQ) {
            this._ultraLowPriUpdateAt = 0;
        }
    }

    getGameObject(): Phaser.GameObjects.Container {
        return this._container;
    }

    private _patrol(): void {
        this._state = 'patroling';
        const now = this.scene.time.now;

        this.ship.rotationContainer.setAngle(this.ship.rotationContainer.angle + 1);
        const player = this.scene.getShip(SpaceSimClient.playerShipId);
        if (player) {
            if (this.canSee(player.location)) {
                this._setLastKnown(player);
                this._attack(player);
            } else if (this._lastKnownPlayerLocation) {
                this._search(this._lastKnownPlayerLocation);
            }
        }
    }

    private _attack(ship: Ship): void {
        this._state = 'attacking';
        const now = this.scene.time.now;

        if (ship) {
            this.ship.lookAt(ship.location);
            if (!this._useWeapons()) {
                this._useEngines();
            }
        }
    }

    private _search(location: Phaser.Types.Math.Vector2Like): void {
        this._state = 'searching';

        const tile = this.scene.getLevel().getTileAtWorldXY(location.x, location.y);
        if (this.scene.getLevel().isWithinTile(this.ship.location, tile)) {
            this._clearLastKnown();
        } else {
            this.ship.lookAt(location);
            this._useEngines();
        }
    }

    private _chase(ship: Ship): void {
        this._state = 'chasing';
        const now = this.scene.time.now;

        if (ship) {
            this.ship.lookAt(ship.location);
            this._useEngines();
        }
    }

    private _avoid(time: number, delta: number): void {
        this._state = 'avoiding';
    }

    private _hasAttacker(): Ship {
        const attackerId = Helpers.getLastAttackerId(this.ship);
        if (attackerId) {
            return this.scene.getShip(attackerId);
        }
        return null;
    }

    canSee(target: Phaser.Types.Math.Vector2Like): boolean {
        if (this._canCheckView) {
            this._canCheckView = false;
            const viewGeom = this.view;
            if (SpaceSim.debug) {
                const graphics = this.scene.add.graphics({ 
                    lineStyle: { width: 2, color: 0x00ff00 }, 
                    fillStyle: { color: 0xffff00, alpha: 0.25 } 
                }).setDepth(Constants.UI.Layers.PLAYER);
                graphics.fillTriangleShape(viewGeom);
                this.scene.tweens.add({
                    targets: graphics,
                    alpha: 0,
                    duration: Constants.Timing.LOW_PRI_UPDATE_FREQ,
                    onComplete: () => {
                        graphics.destroy();
                    }
                });
            }

            const inView = viewGeom.contains(target.x, target.y);
            return inView && !this.scene.getLevel().isWallObscuring(this.ship.location, target);
        }
        return false;
    }

    private _goToLocation(location: Phaser.Types.Math.Vector2Like): void {
        const path = this.scene.getLevel().findPathTo(this.ship.location, location);
    }

    private _useEngines(): boolean {
        const now = this.scene.time.now;
        if (this._nextThrusterFireAt == null || this._nextThrusterFireAt <= now) {
            this.ship.engine.setEnabled(true);
            this._nextThrusterFireAt = now + (this.scene.getShips().length * 10);
            return true;
        }
        return false;
    }

    private _useWeapons(): boolean {
        const now = this.scene.time.now;
        if (this._nextWeaponsFireAt == null || this._nextWeaponsFireAt <= now) {
            this.ship.weapon.setEnabled(true);
            this._nextWeaponsFireAt = now + (this.scene.getShips().length * 50);
            return true;
        }
        return false;
    }

    private _setLastKnown(obj: DynamicGameObject): void {
        this._lastKnownPlayerLocation = obj.location;
        this._lastSawPlayerTime = this.scene.time.now;
    }

    private _clearLastKnown(): void {
        this._lastKnownPlayerLocation = null;
        this._lastSawPlayerTime = null;
    }
}