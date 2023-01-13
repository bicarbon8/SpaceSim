import { BaseScene, Helpers, SpaceSim } from "space-sim-shared";
import { PlayerShip } from "../ships/player-ship";
import { InputController } from "./input-controller";

export class AiController extends InputController {
    private _container: Phaser.GameObjects.Container;
    private _lastKnownPlayerLocation: Phaser.Math.Vector2;
    private _nextWeaponsFireAt: number;
    private _nextThrusterFireAt: number;

    constructor(scene: BaseScene, ship?: PlayerShip) {
        super(scene, ship);
    }

    override get scene(): BaseScene {
        return super.scene as BaseScene;
    }
    
    update(time: number, delta: number): void {
        const attackerId = Helpers.getLastAttackerId(this.ship);
        if (attackerId) {
            const attacker = this.scene.getShipsMap().get(attackerId);
            if (attacker) {
                this.ship.lookAt(attacker.location);
            }
        }
        this.ship.update(time, delta);

        if (attackerId) {
            if (this._nextWeaponsFireAt == null || this._nextWeaponsFireAt <= time) {
                this.ship.getWeapons().trigger();
                this._nextWeaponsFireAt = time + (this.scene.getShipsMap().size * 50);
            } else {
                if (this._nextThrusterFireAt == null || this._nextThrusterFireAt <= time) {
                    this.ship.getThruster().trigger();
                    this._nextThrusterFireAt = time + (this.scene.getShipsMap().size * 10);
                }
            }
        } else {
            this._patrol();
        }
    }

    getGameObject(): Phaser.GameObjects.Container {
        return this._container;
    }

    private _patrol(): void {
        this.ship.setRotation(this.ship.getRotation() + 1);
    }

    private _canSeePlayer(): boolean {
        let canSee: boolean = false;

        return canSee;
    }

    private _lookForPlayer(): void {

    }

    private _chasePlayer(): void {

    }

    private _hideFromPlayer(): void {

    }

    private _goToLocation(location: Phaser.Math.Vector2): void {
        let path: Phaser.Math.Vector2[] = this._generatePathToLocation(location);
    }

    private _generatePathToLocation(location: Phaser.Math.Vector2): Phaser.Math.Vector2[] {
        let path: Phaser.Math.Vector2[] = [];

        return path;
    }
}