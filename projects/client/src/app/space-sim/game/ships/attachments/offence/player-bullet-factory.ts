import { BulletFactory, BulletOptions } from "space-sim-shared";
import { PlayerBullet } from "./player-bullet";

export class PlayerBulletFactory extends BulletFactory<PlayerBullet> {
    generate(options: BulletOptions): PlayerBullet {
        return new PlayerBullet(this.scene, options);
    }
}