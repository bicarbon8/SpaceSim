export interface GameStats {
    shipId: string;
    elapsed: number;
    opponentsDestroyed: number;
    shotsFired: number;
    shotsLanded: number;
    ammoRemaining: number;
    integrityRemaining: number;
}