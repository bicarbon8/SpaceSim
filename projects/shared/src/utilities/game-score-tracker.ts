import { DynamicDataStore } from "dynamic-data-store";
import { Logging } from "./logging";

export module GameScoreTracker {
    export type Destroyed = {
        targetId: string;
        time: number;
    };

    export type Hit = {
        targetId: string;
        damage: number;
        time: number;
    };

    export type GameStats = {
        shipId: string;
        name: string;
        startedAt: number;
        lastUpdatedAt: number;
        opponentsDestroyed: Array<Destroyed>;
        shotsFired: Array<number>;
        shotsLanded: Array<Hit>;
        accuracy: number;
    };

    export type UserScore = {
        name: string;
        score: number;
    };

    export type TrackedItem = {
        id: string,
        name: string
    };
};

export class GameScoreTracker extends DynamicDataStore<GameScoreTracker.GameStats> {
    constructor() {
        super({
            indicies: ['shipId']
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
                shotsFired: new Array<number>(),
                shotsLanded: new Array<GameScoreTracker.Hit>(),
                accuracy: 0
            });
        }
    }

    shotFired(shipId: string): void {
        const stats = this.select({shipId}).first;
        if (stats) {
            stats.shotsFired.push(Date.now());
            Logging.log('trace', {shipId}, 'fired a shot');
            this.updateStats({shipId, shotsFired: stats.shotsFired});
        }
    }

    shotLanded(shotFiredBy: string, targetId: string, damage: number): void {
        const stats = this.select({shipId: shotFiredBy}).first;
        if (stats) {
            stats.shotsLanded.push({
                targetId: targetId,
                damage: damage,
                time: Date.now()
            });
            Logging.log('debug', {shotFiredBy}, 'hit', {targetId}, 'for', {damage});
            this.updateStats({shipId: shotFiredBy, shotsLanded: stats.shotsLanded});
        }
    }

    opponentDestroyed(destroyerShipId: string, destroyedShipId: string): void {
        const stats = this.select({shipId: destroyerShipId}).first;
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

    /**
     * calculates the overall score based on:
     * - opponents destroyed * 100
     * - accuracy * 10
     * so, if 3 oppnents had been destroyed and the accuracy is 25 the resulting
     * score would be 300 + 250 = 550
     * @param shipId the identifier used to lookup the stats and calculate the score
     * @returns a numerical value representing the score
     */
    getScore(shipId: string): number {
        let score: number = 0;
        
        const stats = this.getStats({shipId});
        score = (stats.opponentsDestroyed || []).length * 100;
        score += (stats.accuracy ?? 0) * 10;

        return Number.parseInt(score.toFixed(0));
    }
    
    getLeaderboard(): Array<GameScoreTracker.UserScore> {
        const highScores = new Map<string, GameScoreTracker.UserScore>();
        for (const stats of this.select()) {
            if (stats && stats.name && !highScores.has(stats.name)) {
                // get all scores for same named user and filter out highest
                const userStats = this.select({name: stats.name});
                const lowToHighScores = userStats.map(s => this.getScore(s.shipId))
                    .sort((a, b) => a - b);
                const highestScore = lowToHighScores.pop();
                highScores.set(stats.name, {name: stats.name, score: highestScore});
            }
        }
        const lowToHigh = Array.from(highScores.values()).sort((a, b) => a.score - b.score);
        const highToLow = lowToHigh.reverse();
        return highToLow;
    }

    getStats(query: Partial<GameScoreTracker.GameStats>): GameScoreTracker.GameStats {
        const stats = this.select(query).first;
        return {
            ...stats,
            accuracy: this.getAccuracy(stats.shotsFired?.length ?? 0, stats.shotsLanded?.length ?? 0)
        };
    }

    getAllStats(): Array<GameScoreTracker.GameStats> {
        return this.select();
    }

    updateStats(stats: Partial<GameScoreTracker.GameStats>): void {
        const prev = this.select(stats).first;
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
        const fired = (Number.isNaN(Number(shotsFired))) ? 0 : Number(shotsFired);
        const landed = (Number.isNaN(Number(shotsLanded))) ? 0 : Number(shotsLanded);
        if (fired > 0) {
            accuracy = (landed / fired) * 100;
        }
        return accuracy;
    }
}