import { Mouse } from "matter-js";
import { ShipPod } from "./ships/ship-pod";
export declare module SpaceSim {
    var mouse: Mouse;
    function ships(): ShipPod[];
    function systems(): any[];
    var player: ShipPod;
    function addShips<T extends ShipPod>(...ships: T[]): void;
    function start(): void;
    function stop(): void;
}
