import { OffenceAttachment } from "../ships/attachments/offence/offence-attachment";

export interface BulletOptions {
    scene: Phaser.Scene;
    location: Phaser.Math.Vector2;
    attachment: OffenceAttachment;
    /**
     * the force imparted on the bullet when fired. larger numbers
     * travel faster
     */
    force?: number;
    /**
     * amount of damage this bullet causes if it hits a target
     */
    damage?: number;
    angle?: number;
    startingV?: Phaser.Math.Vector2;
    /**
     * the size of this bullet
     */
    scale?: number;
    spriteName: string;
    /**
     * number of milliseconds before the bullet self-destructs
     * after being fired
     */
    timeout?: number;
}