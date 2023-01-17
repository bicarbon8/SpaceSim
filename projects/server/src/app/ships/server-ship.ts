import { Constants, Ship } from "space-sim-shared";

export class ServerShip extends Ship {
    override destroy(emit?: boolean): void {
        if (emit) {
            this.scene.events.emit(Constants.Events.PLAYER_DEATH, this.config);
        }
    }

    destroyObjects(emit?: boolean): void {
        super.destroy(emit);
    }
}