import { OffenceAttachment } from "../ships/attachments/offence/offence-attachment";

export interface BulletOptions {
    scene: Phaser.Scene;
    location: Phaser.Math.Vector2;
    attachment: OffenceAttachment;
    force?: number;
    angle?: number;
    startingV?: Phaser.Math.Vector2;
    scale?: number;
    spriteName: string;
}