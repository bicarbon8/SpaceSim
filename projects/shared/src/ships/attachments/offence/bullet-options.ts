import { Weapons } from "./weapons";
export interface BulletOptions {
    readonly scene: Phaser.Scene;
    readonly location: Phaser.Math.Vector2;
    readonly weapon: Weapons;
    readonly spriteName: string;
    /**
     * the force imparted on the bullet when fired. larger numbers
     * travel faster
     */
    readonly force?: number;
    /**
     * amount of damage this bullet causes if it hits a target
     */
    readonly damage?: number;
    readonly angle?: number;
    readonly startingV?: Phaser.Math.Vector2;
    /**
     * the size of this bullet
     */
    readonly scale?: number;
    /**
     * number of milliseconds before the bullet self-destructs
     * after being fired
     */
    readonly timeout?: number;
    /**
     * how much influence the impact will have on targets
     */
    readonly mass?: number;
}