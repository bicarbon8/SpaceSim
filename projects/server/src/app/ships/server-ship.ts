import { Constants, Ship } from "space-sim-shared";

export class ServerShip extends Ship {
    override death(emit?: boolean): void {
        if (emit) {
            this.scene.events.emit(Constants.Events.PLAYER_DEATH, this.config);
        }
    }
}