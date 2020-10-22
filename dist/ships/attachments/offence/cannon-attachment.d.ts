import { OffenceAttachment } from "./offence-attachment";
export declare class CannonAttachment extends OffenceAttachment {
    constructor(scene: Phaser.Scene);
    update(): void;
    fire(direction?: Phaser.Math.Vector2): void;
}
