import { ShipConfig } from "../ships/ship";
import { SpaceSim } from "../space-sim";
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
    playerName: string;
    elapsed: number;
    opponentsDestroyed: Array<Destroyed>;
    shotsFired: number;
    shotsLanded: Array<HitsOnTarget>;
    accuracy: number;
    ammoRemaining: number;
    integrityRemaining: number;
    fuelRemaining: number;
};

export type UserScore = {
    name: string;
    score: number;
};

export module GameScoreTracker {
    const _stats = new Map<string, Partial<GameStats>>();

    export function start(opts: ShipConfig): void {
        if (opts) {
            GameScoreTracker.stop(opts.id);
            GameScoreTracker.updateStats(opts.id, {
                shipId: opts.id,
                playerName: opts.name,
                elapsed: 0,
                opponentsDestroyed: new Array<Destroyed>(),
                shotsFired: 0,
                shotsLanded: new Array<HitsOnTarget>(),
                ammoRemaining: opts.remainingAmmo ?? 0,
                integrityRemaining: opts.integrity ?? 0,
                fuelRemaining: opts.remainingFuel ?? 0,
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
            GameScoreTracker.updateStats(id, {shotsFired: stats.shotsFired + 1});
        }
    }
    export function shotLanded(shotFiredBy: string, targetId: string, damage: number): void {
        if (_stats.has(shotFiredBy)) {
            const shotsLanded: Array<HitsOnTarget> = _stats.get(shotFiredBy).shotsLanded || [];
            let index = shotsLanded.findIndex(h => h.targetId === targetId);
            // if target not already registered then add it
            if (index < 0) {
                shotsLanded.push({
                    targetId: targetId,
                    hits: new Array<Hit>()
                });
                index = shotsLanded.length - 1;
            }
            // add hit on target
            shotsLanded[index].hits.push({
                damage: damage,
                time: SpaceSim.game.loop.time
            });
            GameScoreTracker.updateStats(shotFiredBy, {shotsLanded: shotsLanded});
        }
    }
    export function opponentDestroyed(destroyedBy: string, targetId: string): void {
        if (_stats.has(destroyedBy)) {
            const destroyed: Array<Destroyed> = _stats.get(destroyedBy).opponentsDestroyed || [];
            const index = destroyed.findIndex(d => d.targetId === targetId);
            // if target not already listed then add it to list of destroyed
            if (index < 0) {
                Helpers.log('debug', `ship '${destroyedBy}' destroyed ship '${targetId}'`);
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
            const destroyed = _stats.get(id).opponentsDestroyed || [];
            count = destroyed.length;
        }
        return count;
    }
    export function shotsLandedCount(id: string): number {
        let count = 0;
        if (_stats.has(id)) {
            const landed = _stats.get(id).shotsLanded || [];
            count = landed.map(l => l.hits.length)
                .reduce((acc, current) => acc + current, 0);
        }
        return count;
    }
    export function getScore(id: string): number {
        let score: number = 0;
        
        const stats = GameScoreTracker.getStats(id);
        score = (stats.opponentsDestroyed || []).length * 1000;
        score += stats.accuracy;

        return Number.parseFloat(score.toFixed(1));
    }
    export function getLeaderboard(): Array<UserScore> {
        const userScoresArr = new Array<UserScore>();
        for (var id of _stats.keys()) {
            const stats = GameScoreTracker.getStats(id);
            if (stats && stats.playerName) {
                const score = GameScoreTracker.getScore(id);

                userScoresArr.push({name: stats.playerName, score: score});
            }
        }
        const lowToHigh = userScoresArr.sort((a, b) => a.score - b.score);
        const deduped = new Map<string, UserScore>();
        for (let score of lowToHigh) {
            deduped.set(score.name, score);
        }
        const dedupedHighToLow = Array.from(deduped.values()).reverse();
        return dedupedHighToLow;
    }
    export function getStats(id: string): GameStats {
        const stats = _stats.get(id);
        return {
            shipId: id,
            playerName: stats.playerName,
            elapsed: SpaceSim.game.getTime() ?? 0,
            ammoRemaining: stats.ammoRemaining ?? 0,
            integrityRemaining: stats.integrityRemaining ?? 0,
            fuelRemaining: stats.fuelRemaining ?? 0,
            opponentsDestroyed: stats.opponentsDestroyed || [],
            shotsFired: stats.shotsFired ?? 0,
            shotsLanded: stats.shotsLanded || [],
            accuracy: Helpers.getAccuracy(stats.shotsFired ?? 0, GameScoreTracker.shotsLandedCount(id))
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