import { BaseScene, Helpers, Ship } from "space-sim-shared";
import { PlayerShip } from "../ships/player-ship";
import { SpaceSimClient } from "../space-sim-client";
import { InputController } from "./input-controller";

export type AiState = 'patroling' | 'chasing' | 'searching' | 'attacking' | 'avoiding';

export class AiController extends InputController {
    private _container: Phaser.GameObjects.Container;
    private _lastKnownPlayerLocation: Phaser.Types.Math.Vector2Like;
    private _nextWeaponsFireAt: number;
    private _nextThrusterFireAt: number;
    
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
    
    update(time: number, delta: number): void {
        if (this.ship.weapon.enabled) {
            this.ship.weapon.setEnabled(false);
        }
        if (this.ship.engine.enabled) {
            this.ship.engine.setEnabled(false);
        }
        this.ship.update(time, delta);
        
        const attacker = this._hasAttacker();
        if (attacker) {
            if (this._canSeeShip(attacker)) {
                this._lastKnownPlayerLocation = attacker.location;

                this._attack(attacker);
            } else {
                this._chase(attacker);
            }
        } else {
            this._patrol();
        }
    }

    getGameObject(): Phaser.GameObjects.Container {
        return this._container;
    }

    private _patrol(): void {
        this._state = 'patroling';
        this.ship.rotationContainer.setAngle(this.ship.rotationContainer.angle + 1);
        const player = this.scene.getShip(SpaceSimClient.playerShipId);
        if (player) {
            if (this._canSeeShip(player)) {
                this._lastKnownPlayerLocation = player.location;
                this._attack(player);
            }
        }
    }

    private _attack(ship: Ship): void {
        this._state = 'attacking';
        const now = this.scene.time.now;

        if (ship) {
            this.ship.lookAt(ship.location);
            if (this._nextWeaponsFireAt == null || this._nextWeaponsFireAt <= now) {
                this.ship.weapon.setEnabled(true);
                this._nextWeaponsFireAt = now + (this.scene.getShips().length * 50);
            }
        }
    }

    private _search(time: number, delta: number): void {
        this._state = 'searching';
    }

    private _chase(ship: Ship): void {
        this._state = 'chasing';
        const now = this.scene.time.now;

        if (ship) {
            if (this._nextThrusterFireAt == null || this._nextThrusterFireAt <= now) {
                this.ship.engine.setEnabled(true);
                this._nextThrusterFireAt = now + (this.scene.getShips().length * 10);
            }
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

    private _canSeeShip(ship: Ship): boolean {
        if (ship) {
            return this.scene.getLevel().canSee(this.ship, ship, 250);
        }
        return false;
    }

    private _goToLocation(location: Phaser.Types.Math.Vector2Like): void {
        const path = this.scene.getLevel().findPathTo(this.ship.location, location);
    }
}