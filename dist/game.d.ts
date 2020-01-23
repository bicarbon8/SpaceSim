import { Mouse } from "matter-js";
import { ShipPod } from "./ships/ship-pod";
export declare module Game {
    var active: boolean;
    var mouse: Mouse;
    var keys: string[];
    var player: ShipPod;
    function start(): void;
    function stop(): void;
}
