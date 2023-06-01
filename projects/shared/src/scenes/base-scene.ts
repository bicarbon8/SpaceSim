import { SpaceSim } from "../space-sim";
import { GameLevel, GameLevelConfig } from "../levels/game-level";
import { Ship, ShipState } from "../ships/ship";
import { ShipSupply, ShipSupplyOptions } from "../ships/supplies/ship-supply";
import { TryCatch } from "../utilities/try-catch";

export type Priority = 'high' | 'medium' | 'low' | 'ultralow';
export type UpdateAction = (time?: number, delta?: number) => void;

export abstract class BaseScene extends Phaser.Scene {
    private _highPriorityActions = new Map<string, UpdateAction>();
    private _mediumPriorityActions = new Map<string, UpdateAction>();
    private _lowPriorityActions = new Map<string, UpdateAction>();
    private _ultraLowPriorityActions = new Map<string, UpdateAction>();
    private _medPriElapsed: number = SpaceSim.Constants.Timing.MED_PRI_UPDATE_FREQ;
    private _lowPriElapsed: number = SpaceSim.Constants.Timing.LOW_PRI_UPDATE_FREQ;
    private _ultraLowPriElapsed: number = SpaceSim.Constants.Timing.ULTRALOW_PRI_UPDATE_FREQ;

    abstract getLevel<T extends GameLevel>(): T;
    abstract getShip<T extends Ship>(id: string): T;
    abstract getShips<T extends Ship>(): Array<T>;
    abstract getSupply<T extends ShipSupply>(id: string): T;
    abstract getSupplies<T extends ShipSupply>(): Array<T>;

    abstract queueGameLevelUpdate(opts: GameLevelConfig): BaseScene;
    abstract queueShipUpdates(...opts: Array<ShipState>): BaseScene;
    abstract queueShipRemoval(...ids: Array<string>): BaseScene;
    abstract queueSupplyUpdates(...opts: Array<ShipSupplyOptions>): BaseScene;
    abstract queueSupplyRemoval(...ids: Array<string>): BaseScene;
    abstract queueSupplyFlicker(...ids: Array<string>): BaseScene;
    abstract queueEndScene(): BaseScene;

    update(time: number, delta: number): void {
        this._medPriElapsed += delta;
        this._lowPriElapsed += delta;
        this._ultraLowPriElapsed += delta;

        // as fast as possible
        Array.from(this._highPriorityActions.values()).forEach(a => TryCatch.run(() => a(time, delta), 'warn'));
        
        // 30 fps
        if (this._medPriElapsed >= SpaceSim.Constants.Timing.MED_PRI_UPDATE_FREQ) {
            this._medPriElapsed = 0;
            Array.from(this._mediumPriorityActions.values()).forEach(a => TryCatch.run(() => a(time, delta), 'warn'));
        }

        // 15 fps
        if (this._lowPriElapsed >= SpaceSim.Constants.Timing.LOW_PRI_UPDATE_FREQ) {
            this._lowPriElapsed = 0;
            Array.from(this._lowPriorityActions.values()).forEach(a => TryCatch.run(() => a(time, delta), 'warn'));
        }

        // 1 fps
        if (this._ultraLowPriElapsed >= SpaceSim.Constants.Timing.ULTRALOW_PRI_UPDATE_FREQ) {
            this._ultraLowPriElapsed = 0;
            Array.from(this._ultraLowPriorityActions.values()).forEach(a => TryCatch.run(() => a(time, delta), 'warn'));
        }
    }

    /**
     * adds an action to be executed at a predetermined frequency based on priority where `high` runs
     * on every step update, `medium` runs at 30 fps, `low` runs at 15 fps and `ultralow` runs at 1 fps
     * @param priority a string `Priority` used to determine the frequency of execution of the action
     * @param key a string name used to identify the action within its priority group
     * @param action a function that can take in a `time` and `delta` number and returns `void`
     * @returns this object
     */
    addRepeatingAction(priority: Priority, key: string, action: UpdateAction): this {
        switch(priority) {
            case 'high':
                this._highPriorityActions.set(key, action);
                break;
            case 'medium':
                this._mediumPriorityActions.set(key, action);
                break;
            case 'low':
                this._lowPriorityActions.set(key, action);
                break;
            case 'ultralow':
                this._ultraLowPriorityActions.set(key, action);
                break;
        }
        return this;
    }
    removeRepeatingAction(priority: Priority, key: string): this {
        switch(priority) {
            case 'high':
                this._highPriorityActions.delete(key);
                break;
            case 'medium':
                this._mediumPriorityActions.delete(key);
                break;
            case 'low':
                this._lowPriorityActions.delete(key);
                break;
            case 'ultralow':
                this._ultraLowPriorityActions.delete(key);
                break;
        }
        return this;
    }
}