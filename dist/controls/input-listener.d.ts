import { ShipPod } from "../ships/ship-pod";
export declare class InputListener {
    private running;
    run(player: ShipPod): void;
    stop(): void;
    startMouseTracking(player: ShipPod): void;
    startKeyListeners(player: ShipPod): void;
}
