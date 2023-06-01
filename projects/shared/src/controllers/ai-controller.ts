import { Ship } from "../ships/ship";
import { BaseScene } from "../scenes/base-scene";
import { InputController } from "./input-controller";
import { SpaceSim } from "../space-sim";
import { Logging } from "../utilities/logging";
import { Helpers } from "../utilities/helpers";
import { DamageMetadata } from "../interfaces/damage-metadata";

export type AiState = 'patrolling' | 'attacking' | 'chasing';

export class AiController extends InputController {
    private _lastKnownEnemyLocation: Phaser.Types.Math.Vector2Like;
    private _lastSawEnemyTime: number;
    private _nextWeaponsFireAt: number;
    private _nextThrusterFireAt: number;
    private _canCheckView: boolean;
    
    private _medPriUpdateAt: number = SpaceSim.Constants.Timing.MED_PRI_UPDATE_FREQ;
    private _lowPriUpdateAt: number = SpaceSim.Constants.Timing.LOW_PRI_UPDATE_FREQ;
    private _ultraLowPriUpdateAt: number = SpaceSim.Constants.Timing.ULTRALOW_PRI_UPDATE_FREQ;
    
    private _previousState: AiState;
    private _state: AiState;

    private readonly _enemyIds = new Array<string>();
    private readonly _patrolPath = new Array<Phaser.Types.Math.Vector2Like>();
    private readonly _ship: Ship;

    constructor(scene: BaseScene, ship?: Ship) {
        super(scene);
        this._ship = ship;
    }

    override get scene(): BaseScene {
        return super.scene as BaseScene;
    }

    get ship(): Ship {
        return this._ship;
    }

    get state(): AiState {
        return this._state;
    }

    get view(): Phaser.Geom.Polygon {
        const viewDistance = (this.isAggro()) ? 500 : 500 - (this.scene.getShips().length * 2); // less ships = longer view distance
        return Helpers.getView(this.ship.location, this.ship.rotationContainer.angle, viewDistance);
    }
    
    update(time: number, delta: number): void {
        this._medPriUpdateAt += delta;
        this._lowPriUpdateAt += delta;
        this._ultraLowPriUpdateAt += delta;

        if (this.ship.weapon.enabled) {
            this.scene.events.emit(SpaceSim.Constants.Events.WEAPON_FIRING, this.ship.id, false);
        }
        if (this.ship.engine.enabled) {
            this.scene.events.emit(SpaceSim.Constants.Events.ENGINE_ON, this.ship.id, false);
        }

        if (this.ship.active) {
            const attacker = this.hasAttacker();
            if (attacker) { // was attacked?
                // yes attacked...
                this.ship.lookAt(attacker.location);
                if (this.canSee(attacker.location)) { // can see attacker?
                    // yes can see attacker...
                    this._attack(attacker.location);
                } else {
                    // no cannot see attacker
                    if (this.hasLastKnown()) { // has last known?
                        // yes has last known...
                        if (this._goToWorldLocation(this._lastKnownEnemyLocation)) { // is at last known?
                            // yes so clear it
                            this._clearLastKnown();
                        }
                    } else {
                        // no last known...
                        this._patrol();
                    }
                }
            } else {
                // not attacked...
                const enemy = this.canSeeEnemy();
                if (enemy) { // can see enemy?
                    // yes can see enemy...
                    this._attack(enemy.location);
                } else {
                    // no cannot see enemy...
                    if (this.hasLastKnown()) { // has last known?
                        // yes has last known...
                        if (this._goToWorldLocation(this._lastKnownEnemyLocation)) { // is at last known?
                            // yes so clear it
                            this._clearLastKnown();
                        }
                    } else {
                        // no last known...
                        this._patrol();
                    }
                }
            }
        }

        if (this._medPriUpdateAt >= SpaceSim.Constants.Timing.MED_PRI_UPDATE_FREQ) {
            this._medPriUpdateAt = 0;
        }
        if (this._lowPriUpdateAt >= SpaceSim.Constants.Timing.LOW_PRI_UPDATE_FREQ) {
            this._lowPriUpdateAt = 0;
            this._canCheckView = true;
        }
        if (this._ultraLowPriUpdateAt >= SpaceSim.Constants.Timing.ULTRALOW_PRI_UPDATE_FREQ) {
            this._ultraLowPriUpdateAt = 0;
        }
    }

    setEnemyIds(...ids: Array<string>): this {
        this._enemyIds.splice(0, this._enemyIds.length, ...ids);
        return this;
    }

    canSee(target: Phaser.Types.Math.Vector2Like): boolean {
        if (this._canCheckView) {
            this._canCheckView = false;
            const inView = this.view.contains(target.x, target.y);
            return inView && !this.scene.getLevel().isWallObscuring(this.ship.location, target);
        }
        return false;
    }

    canSeeEnemy(): Ship {
        for (let id of this._enemyIds) {
            const ship = this.scene.getShip(id);
            if (ship && this.canSee(ship.location)) {
                return ship;
            }
        }
        return null;
    }

    hasAttacker(): Ship {
        const attackerId = DamageMetadata.getLastAttackerId(this.ship);
        if (attackerId) {
            return this.scene.getShip(attackerId);
        }
        return null;
    }

    hasLastKnown(): boolean {
        const now = this.scene.time.now;
        const timeout: number = (this.isAggro()) ? 60000 : 10000;
        if (this._lastSawEnemyTime && (now - timeout) > this._lastSawEnemyTime) {
            this._clearLastKnown();
        }
        if (this._lastKnownEnemyLocation) {
            return true;
        }
        return false;
    }

    canUseWeapons(): boolean {
        const now = this.scene.time.now;
        if (this._nextWeaponsFireAt == null) {
            this._nextWeaponsFireAt = now + (this.scene.getShips().length * 50) + Phaser.Math.RND.realInRange(0, 1);
        }
        if (this._nextWeaponsFireAt <= now) {
            return true;
        }
        return false;
    }

    canUseEngines(): boolean {
        const now = this.scene.time.now;
        if (this._nextThrusterFireAt == null || this._nextThrusterFireAt <= now) {
            return true;
        }
        return false;
    }

    isAggro(): boolean {
        const attacker = this.hasAttacker();
        if (attacker) {
            return true;
        }
        return false;
    }

    private _setState(state: AiState): void {
        this._previousState = this._state;
        this._state = state;
        if (this._previousState != this._state) {
            Logging.log('debug', `ship: '${this.ship.name}' state changed from '${this._previousState}' to '${this._state}'`);
        }
    }

    private _patrol(): void {
        this._setState('patrolling');
        if (this._patrolPath.length < 1) {
            const shipLoc = this.ship.location;
            const { width, height, left, top } = this.scene.getLevel().getRoomAtWorldXY(shipLoc.x, shipLoc.y);
            const randTileXInRoom = Phaser.Math.RND.between(left + 2, (left + width) - 2);
            const randTileYInRoom = Phaser.Math.RND.between(top + 2, (top + height) - 2);
            const worldLoc = this.scene.getLevel().tileToWorldXY(randTileXInRoom, randTileYInRoom);
            const pathTileLocations = this._getPathTo(worldLoc);
            this._patrolPath.splice(0, this._patrolPath.length, ...pathTileLocations);
        }
        if (this._goToWorldLocation(this._patrolPath[0])) {
            // we reached the location so remove it from path array
            this._patrolPath.shift();
        }
    }

    private _attack(target: Phaser.Types.Math.Vector2Like): void {
        this._setLastKnown(target);
        this._lookAtLastKnown();
        if (this.canUseWeapons()) {
            this._setState('attacking');
            this._useWeapons();
        } else {
            this._setState('chasing');
            this._goToWorldLocation(target);
        }
    }

    /**
     * has ship look at the specified world location and engage engines. this should
     * be called until it returns `true` indicating the location was reached
     * @param worldXY a world location to navigate to
     * @returns `true` if we reached the location, otherwise `false`
     */
    private _goToWorldLocation(worldXY: Phaser.Types.Math.Vector2Like): boolean {
        const tile = this.scene.getLevel().getTileAtWorldXY(worldXY.x, worldXY.y);
        if (tile) {
            return this._goToTileLocation(tile);
        }
        return false;
    }

    /**
     * has ship look at the specified tile location and engage engines. this should
     * be called until it returns `true` indicating the location was reached
     * @param tileXY a map tile location to navigate to
     * @returns `true` if we reached the location, otherwise `false`
     */
    private _goToTileLocation(tileXY: Phaser.Types.Math.Vector2Like): boolean {
        if (this.scene.getLevel().isWithinTile(this.ship.location, tileXY)) {
            return true;
        } else {
            const worldXY = this.scene.getLevel().getMapTileWorldLocation(tileXY.x, tileXY.y);
            this.ship.lookAt(worldXY);
            this._useEngines();
            return false;
        }
    }

    private _getPathTo(location: Phaser.Types.Math.Vector2Like): Array<Phaser.Types.Math.Vector2Like> {
        return this.scene.getLevel().findPathTo(this.ship.location, location);
    }

    private _useEngines(): boolean {
        const now = this.scene.time.now;
        if (this.canUseEngines()) {
            this.scene.events.emit(SpaceSim.Constants.Events.ENGINE_ON, this.ship.id, true);
            this._nextThrusterFireAt = now + (this.scene.getShips().length * 10) + Phaser.Math.RND.realInRange(0, 500);
            return true;
        }
        return false;
    }

    private _useWeapons(): boolean {
        const now = this.scene.time.now;
        if (this.canUseWeapons()) {
            this.scene.events.emit(SpaceSim.Constants.Events.WEAPON_FIRING, this.ship.id, true);
            this._nextWeaponsFireAt = now + (this.scene.getShips().length * 50) + Phaser.Math.RND.realInRange(0, 1);
            return true;
        }
        return false;
    }

    private _lookAtLastKnown(): void {
        this.ship.lookAt(this._lastKnownEnemyLocation);
    }

    private _setLastKnown(location: Phaser.Types.Math.Vector2Like): void {
        this._lastKnownEnemyLocation = location;
        this._lastSawEnemyTime = this.scene.time.now;
    }

    private _clearLastKnown(): void {
        this._lastKnownEnemyLocation = null;
        this._lastSawEnemyTime = null;
    }
}