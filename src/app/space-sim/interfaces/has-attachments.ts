import { ShipAttachment } from "../ships/attachments/ship-attachment";
import { AttachmentLocation } from "../ships/attachments/attachment-location";

export interface HasAttachments {
    rotateAttachmentsClockwise(): void;
    rotateAttachmentsAntiClockwise(): void;
    addAttachment<T extends ShipAttachment>(attachment: T): void;
    removeAttachmentAt(location: AttachmentLocation): void;
    throwAttachmentAt(location: AttachmentLocation): void;
    getAttachments(): ShipAttachment[];
    getAttachmentAt<T extends ShipAttachment>(location: AttachmentLocation): T;
}