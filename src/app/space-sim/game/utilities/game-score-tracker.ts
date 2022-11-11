import { AttachmentLocation } from "../ships/attachments/attachment-location";
import { OffenceAttachment } from "../ships/attachments/offence/offence-attachment";
import { SpaceSim } from "../space-sim";
import { GameStats } from "./game-stats";

export module GameScoreTracker {
    var _opponentsDestroyed: number;
    var _shotsFired: number;
    var _shotsLanded: number;

    export function start(): void {
        _opponentsDestroyed = 0;
        _shotsFired = 0;
        _shotsLanded = 0;
    }
    export function shotFired(): void {
        _shotsFired++;
    }
    export function shotLanded(): void {
        _shotsLanded++;
    }
    export function opponentDestroyed(): void {
        _opponentsDestroyed++;
    }
    export function getScore(): number {
        let score: number = 0;

        score = (_opponentsDestroyed * 1000)
        + (SpaceSim.player.getRemainingFuel())
        + (SpaceSim.player.getIntegrity())
        + (SpaceSim.player.attachments.getAttachmentAt(AttachmentLocation.front) as OffenceAttachment)?.ammo;

        score += (_shotsFired > 0) ? ((_shotsLanded * 100) / _shotsFired) : 0;
        
        return score;
    }
    export function getStats(): GameStats {
        return {
            elapsed: SpaceSim.game.getTime(),
            ammoRemaining: (SpaceSim.player.attachments.getAttachmentAt(AttachmentLocation.front) as OffenceAttachment)?.ammo,
            integrityRemaining: SpaceSim.player.getIntegrity(),
            opponentsDestroyed: _opponentsDestroyed,
            shotsFired: _shotsFired,
            shotsLanded: _shotsLanded
        };
    }
}