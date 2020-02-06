import { ShipAttachment } from "../ships/attachments/ship-attachment";
import { AttachmentLocation } from "../ships/attachments/attachment-location";

export interface HasAttachments {
    rotateAttachmentsClockwise(): void;
    rotateAttachmentsAntiClockwise(): void;
    addAttachment(attachment: ShipAttachment): void;
    removeAttachment(location: AttachmentLocation): void;
    throwAttachment(location: AttachmentLocation): void;
    getAttachments(): ShipAttachment[];
    getAttachment(location: AttachmentLocation): ShipAttachment;
}