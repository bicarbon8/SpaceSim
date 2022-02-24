import { ShipAttachmentOptions } from "../ship-attachment-options";

export interface OffenceAttachmentOptions extends ShipAttachmentOptions {
    remainingAmmo?: number;
}