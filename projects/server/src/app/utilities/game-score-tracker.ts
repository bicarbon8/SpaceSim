import { ShipLike } from "../interfaces/ship-like";
import { Ship } from "../ships/ship";
import { ShipOptions } from "../ships/ship-options";
import { SpaceSim } from "../space-sim";
import { GameStats } from "./game-stats";

export module GameScoreTracker {
    const _stats = new Map<string, Partial<GameStats>>();

    export function start(id: string): void {
        updateStats(id, {
            opponentsDestroyed: 0,
            shotsFired: 0,
            shotsLanded: 0
        });
    }
    export function shotFired(id: string): void {
        if (_stats.has(id)) {
            const stats = _stats.get(id);
            updateStats(id, {...stats, shotsFired: stats.shotsFired++});
        }
    }
    export function shotLanded(id: string): void {
        if (_stats.has(id)) {
            const stats = _stats.get(id);
            updateStats(id, {...stats, shotsLanded: stats.shotsLanded++});
        }
    }
    export function opponentDestroyed(id: string): void {
        if (_stats.has(id)) {
            const stats = _stats.get(id);
            updateStats(id, {...stats, opponentsDestroyed: stats.opponentsDestroyed++});
        }
    }
    export function getScore(id: string): number {
        let score: number = 0;
        if (_stats.has(id)) {
            const stats = _stats.get(id);
            score = stats.opponentsDestroyed * 1000;
            score += (stats.shotsFired > 0) ? ((stats.shotsLanded * 100) / stats.shotsFired) : 0;
        }
        return score;
    }
    export function getStats(opts: ShipOptions): GameStats {
        const stats = _stats.get(opts.id) || {opponentsDestroyed: 0, shotsFired: 0, shotsLanded: 0};
        return {
            elapsed: SpaceSim.game.getTime(),
            ammoRemaining: opts.remainingAmmo ?? 0,
            integrityRemaining: opts.integrity ?? 0,
            opponentsDestroyed: stats.opponentsDestroyed,
            shotsFired: stats.shotsFired,
            shotsLanded: stats.shotsLanded
        };
    }
    export function updateStats(id: string, stats: Partial<GameStats>): void {
        _stats.set(id, stats);
    }
}