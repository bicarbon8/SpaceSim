import { Constants, Ship } from "space-sim-shared";

export class ServerShip extends Ship {
    override death(emit: boolean = true): void {
        if (this.active) {
            if (emit) {
                this.scene.events.emit(Constants.Events.SHIP_DEATH, this.config);
            }
        }
    }
}