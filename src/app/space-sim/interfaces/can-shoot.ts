export interface CanShoot {
    reload(amount: number): void;
    getRemainingAmmo(): number;
    fire(direction?: Phaser.Math.Vector2): void;
}