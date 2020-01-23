import * as $ from "jquery";
import { SpaceSim } from "../space-sim";
import { Keys } from "./keys";
import { ShipPod } from "../ships/ship-pod";

export class InputListener {
    private running: boolean = false;

    run(player: ShipPod): void {
        this.running = true;
        this.startMouseTracking(player);
        this.startKeyListeners(player);
    }

    stop(): void {
        this.running = false;
    }

    startMouseTracking(player: ShipPod): void {
        if (this.running) {
            player.lookAt(SpaceSim.mouse.position);
            window.requestAnimationFrame(() => {
                this.startMouseTracking(player);
            });
        }
    }

    startKeyListeners(player: ShipPod): void {
        if (this.running) {
            $(window).keydown((event) => {
                switch (event.which) {
                    case Keys.SPACE:
                        player.activateThruster();
                        break;
                }
            });
        }
    }
}