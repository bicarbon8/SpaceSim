import { HasAttachments } from "../../interfaces/has-attachments";
import { ShipAttachment } from "./ship-attachment";
import { AttachmentLocation } from "./attachment-location";
import { Updatable } from "../../interfaces/updatable";
import { ShipPod } from "../ship-pod";
export declare class AttachmentManager implements HasAttachments, Updatable {
    private attachments;
    private ship;
    active: boolean;
    constructor(parent: ShipPod);
    update(): void;
    rotateAttachmentsClockwise(): void;
    rotateAttachmentsAntiClockwise(): void;
    /**
     * adds the passed in {ShipAttachment} in {AttachmentLocation.front} or
     * the first open {AttachmentLocation} in a clockwise search. if no open
     * slots exist then the existing {ShipAttachment} at {AttachmentLocation.front}
     * is detached and replaced with the passed in {ShipAttachment}
     * @param attachment the attachment to be added
     */
    addAttachment(attachment: ShipAttachment): void;
    removeAttachment(location: AttachmentLocation): void;
    throwAttachment(location: AttachmentLocation): void;
    getAttachments(): ShipAttachment[];
    getAttachment(location: AttachmentLocation): ShipAttachment;
    private updateAttachmentPositions;
}
