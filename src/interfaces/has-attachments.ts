import { ShipAttachment } from "../ships/attachments/ship-attachment";

export interface HasAttachments {
    rotateAttachmentsClockwise(): void;
    rotateAttachmentsAntiClockwise(): void;
    addAttachment(attachment: ShipAttachment): void;
}