import { Ship } from "../ships/ship";
import { InputController } from "./input-controller";

export class AiController extends InputController {
    private _container: Phaser.GameObjects.Container;
    private _aiShip: Ship;
    private _lastKnownPlayerLocation: Phaser.Math.Vector2;
    
    constructor(scene: Phaser.Scene, aiShip: Ship) {
        super(scene);
        this._aiShip = aiShip;
    }
    
    update(time: number, delta: number): void {
        if (!this.player) {
            this._patrol();
        } else {
            if (this._canSeePlayer()) {
                this._lastKnownPlayerLocation = this.player.getLocation();
            } else {
                if (this._aiShip.getLocation().fuzzyEquals(this._lastKnownPlayerLocation, 1)) {
                    this._patrol();
                } else {
                    this._goToLocation(this._lastKnownPlayerLocation);
                }
            }
        }
    }

    async goTo(location: Phaser.Math.Vector2): Promise<void> {
        let startingPos: Phaser.Math.Vector2 = this._aiShip.getLocation();
        let distance: number = location.distance(startingPos);
        this._aiShip.lookAtTarget();
        this._aiShip.getThruster().thrustFowards();
        
    }

    getGameObject(): Phaser.GameObjects.Container {
        return this._container;
    }

    private _patrol(): void {
        this._aiShip.setRotation(this._aiShip.getRotation() + 1);
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