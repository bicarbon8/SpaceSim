import { ShipOptions } from "../ships/ship-options";
import { SpaceSim } from "../space-sim";
import { Constants } from "./constants";
import { Helpers } from "./helpers";

export type Destroyed = {
    targetId: string;
    time: number;
};

export type Hit = {
    damage: number;
    time: number;
}

export type HitsOnTarget = {
    targetId: string;
    hits: Array<Hit>;
}

export type GameStats = {
    shipId: string;
    elapsed: number;
    opponentsDestroyed: Array<Destroyed>;
    shotsFired: number;
    shotsLanded: Array<HitsOnTarget>;
    accuracy: number;
    ammoRemaining: number;
    integrityRemaining: number;
    fuelRemaining: number;
};

export module GameScoreTracker {
    const _stats = new Map<string, Partial<GameStats>>();

    export function start(opts: ShipOptions): void {
        if (opts) {
            GameScoreTracker.stop(opts.id);
            GameScoreTracker.updateStats(opts.id, {
                shipId: opts.id,
                elapsed: 0,
                opponentsDestroyed: new Array<Destroyed>(),
                shotsFired: 0,
                shotsLanded: new Array<HitsOnTarget>(),
                ammoRemaining: opts.remainingAmmo,
                integrityRemaining: opts.integrity,
                fuelRemaining: opts.remainingFuel,
                accuracy: 0
            });
        }
    }
    export function stop(id: string): Partial<GameStats> {
        const stats = _stats.get(id);
        _stats.delete(id);
        return stats;
    }
    export function reset(): void {
        _stats.clear();
    }

    export function shotFired(id: string): void {
        if (_stats.has(id)) {
            const stats = _stats.get(id);
            GameScoreTracker.updateStats(id, {shotsFired: +stats.shotsFired + 1});
        }
    }
    export function shotLanded(shotFiredBy: string, targetId: string, damage: number): void {
        if (_stats.has(shotFiredBy)) {
            const shotsLanded: Array<HitsOnTarget> = _stats.get(shotFiredBy).shotsLanded;
            let index = shotsLanded.findIndex(h => h.targetId === targetId);
            if (index < 0) {
                shotsLanded.push({
                    targetId: targetId,
                    hits: new Array<Hit>()
                });
                index = shotsLanded.length - 1;
            }
            shotsLanded[index].hits.push({
                damage: damage,
                time: SpaceSim.game.loop.time
            });
            GameScoreTracker.updateStats(shotFiredBy, {shotsLanded: shotsLanded});
        }
    }
    export function opponentDestroyed(destroyedBy: string, targetId: string): void {
        if (_stats.has(destroyedBy)) {
            const destroyed: Array<Destroyed> = _stats.get(destroyedBy).opponentsDestroyed;
            const index = destroyed.findIndex(d => d.targetId === targetId);
            if (index < 0) {
                destroyed.push({
                    targetId: targetId,
                    time: SpaceSim.game.loop.time
                });
                GameScoreTracker.updateStats(destroyedBy, {opponentsDestroyed: destroyed});
            }
        }
    }
    export function damageTaken(id: string, integrity: number): void {
        if (_stats.has(id)) {
            GameScoreTracker.updateStats(id, {integrityRemaining: integrity});
        }
    }
    export function destroyedCount(id: string): number {
        let count = 0;
        if (_stats.has(id)) {
            const destroyed = _stats.get(id).opponentsDestroyed;
            count = destroyed.length;
        }
        return count;
    }
    export function shotsLandedCount(id: string): number {
        let count = 0;
        if (_stats.has(id)) {
            const landed = _stats.get(id).shotsLanded;
            count = landed.map(l => l.hits.length)
                .reduce((acc, current) => acc + current, 0);
        }
        return count;
    }
    export function getScore(id: string): number {
        let score: number = 0;
        
        const stats = GameScoreTracker.getStats(id);
        score = GameScoreTracker.destroyedCount(id) * 1000;
        score += stats.accuracy;
        score += (stats.ammoRemaining / Constants.Ship.Weapons.MAX_AMMO) * 100;
        score += (stats.integrityRemaining / Constants.Ship.MAX_INTEGRITY) * 100;
        score += (stats.fuelRemaining / Constants.Ship.MAX_FUEL) * 100;

        return score;
    }
    export function getStats(id: string): GameStats {
        const stats = _stats.get(id);
        return {
            shipId: id,
            elapsed: SpaceSim.game.getTime(),
            ammoRemaining: stats.ammoRemaining ?? 0,
            integrityRemaining: stats.integrityRemaining ?? 0,
            fuelRemaining: stats.fuelRemaining ?? 0,
            opponentsDestroyed: stats.opponentsDestroyed,
            shotsFired: stats.shotsFired ?? 0,
            shotsLanded: stats.shotsLanded,
            accuracy: Helpers.getAccuracy(stats.shotsFired, GameScoreTracker.shotsLandedCount(id))
        };
    }
    export function getAllStats(): Array<Partial<GameStats>> {
        const stats = new Array<Partial<GameStats>>();
        _stats.forEach(stat => stats.push(stat));
        return stats;
    }
    export function updateStats(id: string, stats: Partial<GameStats>): void {
        const prev = _stats.get(id);
        _stats.set(id, {
            ...prev,
            ...stats
        });
    }
    export function updateAllStats(...stats: Array<Partial<GameStats>>): void {
        for (var i=0; i<stats.length; i++) {
            let stat = stats[i];
            GameScoreTracker.updateStats(stat.shipId, stat);
        }
    }
}