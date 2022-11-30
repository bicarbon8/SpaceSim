import { SpaceSim } from "../space-sim";
import { GameScoreTracker } from "../utilities/game-score-tracker";
import { InputController } from "./input-controller";

export class AiController extends InputController {
    private _container: Phaser.GameObjects.Container;
    private _lastKnownPlayerLocation: Phaser.Math.Vector2;
    private _nextWeaponsFireAt: number;
    private _nextThrusterFireAt: number;
    
    update(time: number, delta: number): void {
        this.ship.update(time, delta);

        if (this.ship.target) {
            if (this._nextWeaponsFireAt == null || this._nextWeaponsFireAt <= time) {
                this.ship.getWeapons().trigger();
                this._nextWeaponsFireAt = time + ((SpaceSim.opponents.length - GameScoreTracker.getStats().opponentsDestroyed) * 50);
            } else {
                if (this._nextThrusterFireAt == null || this._nextThrusterFireAt <= time) {
                    this.ship.getThruster().trigger();
                    this._nextThrusterFireAt = time + ((SpaceSim.opponents.length - GameScoreTracker.getStats().opponentsDestroyed) * 10);
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