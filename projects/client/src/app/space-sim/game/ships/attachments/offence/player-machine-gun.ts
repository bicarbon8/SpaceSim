import { Bullet, BulletOptions, MachineGun } from "space-sim-shared";
import { PlayerBullet } from "./player-bullet";

export class PlayerMachineGun extends MachineGun {
    override getBullet(options: BulletOptions): Bullet {
        let bullet: PlayerBullet;
        if (this.ship) {
            bullet = new PlayerBullet(this.scene, options);
        }
        return bullet;
    }
}