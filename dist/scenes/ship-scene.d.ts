import { ZoomableScene } from "./zoomable-scene";
export declare class ShipScene extends ZoomableScene {
    private player;
    /** Input Handlers */
    private thrustKey;
    private boostKey;
    private rotateAttachmentsClockwiseKey;
    private rotateAttachmentsAntiClockwiseKey;
    private detachAttachmentKey;
    constructor();
    preload(): void;
    create(): void;
    update(): void;
    private setupInputHandling;
    private setupCamera;
}
