import { SpaceSimClient } from "../space-sim-client";
import { GameScoreTracker, SpaceSim } from "space-sim-server";
import { InputController } from "./input-controller";

export class AiController extends InputController {
    private _container: Phaser.GameObjects.Container;
    private _lastKnownPlayerLocation: Phaser.Math.Vector2;
    private _nextWeaponsFireAt: number;
    private _nextThrusterFireAt: number;
    
    update(time: number, delta: number): void {
        const attackerId = Array.from(new Set<string>(this.ship.damageSources
            .filter(d => d.attackerId != null)
            .map(d => d.attackerId)).values())
            .pop();
        if (attackerId) {
            const attacker = SpaceSim.players().find(p => p.id === attackerId);
            if (attacker) {
                this.ship.setTarget(attacker);
            }
        }
        this.ship.update(time, delta);

        if (this.ship.target) {
            if (this._nextWeaponsFireAt == null || this._nextWeaponsFireAt <= time) {
                this.ship.getWeapons().trigger();
                this._nextWeaponsFireAt = time + ((SpaceSimClient.opponents.length - GameScoreTracker.getStats(this.ship).opponentsDestroyed) * 50);
            } else {
                if (this._nextThrusterFireAt == null || this._nextThrusterFireAt <= time) {
                    this.ship.getThruster().trigger();
                    this._nextThrusterFireAt = time + ((SpaceSimClient.opponents.length - GameScoreTracker.getStats(this.ship).opponentsDestroyed) * 10);
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