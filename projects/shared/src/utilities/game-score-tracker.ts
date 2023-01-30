import { DataTable } from "./data-table";
import { Logging } from "./logging";

export module GameScoreTracker {
    export type Destroyed = {
        targetId: string;
        time: number;
    };

    export type Hit = {
        damage: number;
        time: number;
    };

    export type HitsOnTarget = {
        targetId: string;
        hits: Array<Hit>;
    };

    export type GameStats = {
        shipId: string;
        name: string;
        startedAt: number;
        lastUpdatedAt: number;
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

    export type TrackedItem = {
        id: string,
        name: string,
        integrity: number,
        remainingAmmo: number,
        remainingFuel: number
    };
};

export class GameScoreTracker extends DataTable<GameScoreTracker.GameStats> {
    constructor() {
        super({
            indexKeys: ['shipId']
        });
    }

    start(opts: GameScoreTracker.TrackedItem): void {
        if (opts) {
            const now = Date.now();
            this.add({
                shipId: opts.id,
                name: opts.name,
                startedAt: now,
                lastUpdatedAt: now,
                opponentsDestroyed: new Array<GameScoreTracker.Destroyed>(),
                shotsFired: 0,
                shotsLanded: new Array<GameScoreTracker.HitsOnTarget>(),
                ammoRemaining: opts.remainingAmmo ?? 0,
                integrityRemaining: opts.integrity ?? 0,
                fuelRemaining: opts.remainingFuel ?? 0,
                accuracy: 0
            });
        }
    }

    shotFired(shipId: string): void {
        const stats = this.get({shipId});
        if (stats) {
            Logging.log('trace', {shipId}, 'fired a shot');
            this.updateStats({shipId, shotsFired: stats.shotsFired + 1});
        }
    }

    shotLanded(shotFiredBy: string, targetId: string, damage: number): void {
        const stats = this.get({shipId: shotFiredBy});
        if (stats) {
            const shotsLanded: Array<GameScoreTracker.HitsOnTarget> = stats.shotsLanded;
            let index = shotsLanded.findIndex(h => h.targetId === targetId);
            // if target not already registered then add it
            if (index < 0) {
                shotsLanded.push({
                    targetId: targetId,
                    hits: new Array<GameScoreTracker.Hit>()
                });
                index = shotsLanded.length - 1;
            }
            Logging.log('debug', {shotFiredBy}, 'hit', {targetId}, 'for', {damage});
            // add hit on target
            shotsLanded[index].hits.push({
                damage: damage,
                time: Date.now()
            });
            this.updateStats({shipId: shotFiredBy, shotsLanded: shotsLanded});
        }
    }

    opponentDestroyed(destroyerShipId: string, destroyedShipId: string): void {
        const stats = this.get({shipId: destroyerShipId});
        if (stats) {
            const destroyed: Array<GameScoreTracker.Destroyed> = stats.opponentsDestroyed;
            const index = destroyed.findIndex(d => d.targetId === destroyedShipId);
            // if target not already listed then add it to list of destroyed
            if (index < 0) {
                Logging.log('info', {destroyerShipId}, 'destroyed', {destroyedShipId});
                destroyed.push({
                    targetId: destroyedShipId,
                    time: Date.now()
                });
                this.updateStats({shipId: destroyerShipId, opponentsDestroyed: destroyed});
            }
        }
    }

    damageTaken(shipId: string, integrity: number): void {
        const stats = this.get({shipId});
        if (stats) {
            this.updateStats({shipId, integrityRemaining: integrity});
        }
    }

    destroyedCount(shipId: string): number {
        let count = 0;
        const stats = this.get({shipId});
        if (stats) {
            const destroyed = stats.opponentsDestroyed;
            count = destroyed.length;
        }
        return count;
    }

    shotsLandedCount(shipId: string): number {
        let count = 0;
        const stats = this.get({shipId});
        if (stats) {
            const landed = stats.shotsLanded;
            count = landed.map(l => l.hits.length)
                .reduce((acc, current) => acc + current, 0);
        }
        return count;
    }

    getScore(shipId: string): number {
        let score: number = 0;
        
        const stats = this.getStats({shipId});
        score = (stats.opponentsDestroyed || []).length * 1000;
        score += stats.accuracy;

        return Number.parseFloat(score.toFixed(1));
    }
    
    getLeaderboard(): Array<GameScoreTracker.UserScore> {
        const userScoresArr = new Array<GameScoreTracker.UserScore>();
        for (const shipId of this.select().map(s => s.shipId)) {
            const stats = this.getStats({shipId});
            if (stats && stats.name) {
                const score = this.getScore(shipId);

                userScoresArr.push({name: stats.name, score: score});
            }
        }
        const lowToHigh = userScoresArr.sort((a, b) => a.score - b.score);
        const deduped = new Map<string, GameScoreTracker.UserScore>();
        for (let score of lowToHigh) {
            deduped.set(score.name, score);
        }
        const dedupedHighToLow = Array.from(deduped.values()).reverse();
        return dedupedHighToLow;
    }

    getStats(query: Partial<GameScoreTracker.GameStats>): GameScoreTracker.GameStats {
        const stats = this.selectFirst(query);
        return {
            ...stats,
            accuracy: this.getAccuracy(stats.shotsFired ?? 0, stats.shotsLanded?.length ?? 0)
        };
    }

    getAllStats(): Array<GameScoreTracker.GameStats> {
        return this.select();
    }

    updateStats(stats: Partial<GameScoreTracker.GameStats>): void {
        const prev = this.get(stats);
        const updated = {
            ...stats,
            lastUpdatedAt: Date.now()
        } as GameScoreTracker.GameStats;
        if (prev) {
            this.update(updated);
        } else {
            this.add(updated);
        }
    }

    updateAllStats(...stats: Array<Partial<GameScoreTracker.GameStats>>): void {
        for (const stat of stats) {
            if (stat) {
                this.updateStats(stat);
            }
        }
    }

    getAccuracy(shotsFired: number, shotsLanded: number): number {
        let accuracy = 0;
        if (+shotsFired > 0) {
            accuracy = (+shotsLanded / shotsFired) * 100;
        }
        return accuracy;
    }
}