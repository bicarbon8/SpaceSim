import { BaseScene, Constants, Helpers, Ship, SpaceSim } from "space-sim-shared";
import { PlayerShip } from "../ships/player-ship";
import { InputController } from "./input-controller";

export type AiPatrolState = 'sweeping' | 'navigating';

export class AiController extends InputController {
    private _lastKnownEnemyLocation: Phaser.Types.Math.Vector2Like;
    private _lastSawEnemyTime: number;
    private _nextWeaponsFireAt: number;
    private _nextThrusterFireAt: number;
    private _canCheckView: boolean;
    private _viewGeom: Phaser.Geom.Triangle;
    
    private _medPriUpdateAt: number = Constants.Timing.MED_PRI_UPDATE_FREQ;
    private _lowPriUpdateAt: number = Constants.Timing.LOW_PRI_UPDATE_FREQ;
    private _ultraLowPriUpdateAt: number = Constants.Timing.ULTRALOW_PRI_UPDATE_FREQ;
    
    private _state: AiPatrolState = 'sweeping';

    private readonly _enemyIds = new Array<string>();
    private readonly _patrolPath = new Array<Phaser.Types.Math.Vector2Like>();
    private _patrolSweepAngle: number = 0;

    constructor(scene: BaseScene, ship?: PlayerShip) {
        super(scene, ship);
    }

    override get scene(): BaseScene {
        return super.scene as BaseScene;
    }

    get state(): AiPatrolState {
        return this._state;
    }

    get view(): Phaser.Geom.Triangle {
        if (!this._viewGeom) {
            this._viewGeom = new Phaser.Geom.Triangle();
        }

        const viewDistance = (this.isAggro()) ? 500 : 500 - (this.scene.getShips().length * 2); // less ships = longer view distance
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
                        if (this._search(this._lastKnownEnemyLocation)) { // is at last known?
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
                        if (this._search(this._lastKnownEnemyLocation)) { // is at last known?
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

    setEnemyIds(...ids: Array<string>): this {
        this._enemyIds.splice(0, this._enemyIds.length, ...ids);
        return this;
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
        const attackerId = Helpers.getLastAttackerId(this.ship);
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
        if (this._nextWeaponsFireAt == null || this._nextWeaponsFireAt <= now) {
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

    private _patrol(): void {
        switch(this._state) {
            case 'sweeping':
                this.ship.rotationContainer.setAngle(this._patrolSweepAngle);
                if (this._patrolSweepAngle >= 360) {
                    this._patrolSweepAngle = 0;
                    this._state = 'navigating';
                }
                this._patrolSweepAngle += 10 - (this.scene.getShips().length / 10);
                break;
            case 'navigating':
            default:
                if (this._patrolPath.length < 1) {
                    const shipLoc = this.ship.location;
                    const { width, height, left, top } = this.scene.getLevel().getRoomAtWorldXY(shipLoc.x, shipLoc.y);
                    const randTileXInRoom = Phaser.Math.RND.between(left + 2, (left + width) - 2);
                    const randTileYInRoom = Phaser.Math.RND.between(top + 2, (top + height) - 2);
                    const worldLoc = this.scene.getLevel().tileToWorldXY(randTileXInRoom, randTileYInRoom);
                    this._patrolPath.push(worldLoc);
                }
                if (this._search(this._patrolPath[0])) {
                    this._patrolPath.shift();
                }
                this._state = 'sweeping';
                break;
        }
    }

    private _attack(target: Phaser.Types.Math.Vector2Like): void {
        this._setLastKnown(target);
        this._lookAtLastKnown();
        if (this.canUseWeapons()) {
            this._useWeapons();
        } else {
            this._search(target);
        }
    }

    /**
     * has ship look at the specified `location` and engage engines. this should
     * be called until it returns `true` indicating the `location` was reached
     * @param location a location to navigate to
     * @returns `true` if we reached the location, otherwise `false`
     */
    private _search(location: Phaser.Types.Math.Vector2Like): boolean {
        const tile = this.scene.getLevel().getTileAtWorldXY(location.x, location.y);
        if (this.scene.getLevel().isWithinTile(this.ship.location, tile)) {
            return true;
        } else {
            this.ship.lookAt(location);
            this._useEngines();
            return false;
        }
    }

    private _goToLocation(location: Phaser.Types.Math.Vector2Like): void {
        const path = this.scene.getLevel().findPathTo(this.ship.location, location);
    }

    private _useEngines(): boolean {
        const now = this.scene.time.now;
        if (this.canUseEngines()) {
            this.ship.engine.setEnabled(true);
            this._nextThrusterFireAt = now + (this.scene.getShips().length * 10);
            return true;
        }
        return false;
    }

    private _useWeapons(): boolean {
        const now = this.scene.time.now;
        if (this.canUseWeapons()) {
            this.ship.weapon.setEnabled(true);
            this._nextWeaponsFireAt = now + (this.scene.getShips().length * 50);
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