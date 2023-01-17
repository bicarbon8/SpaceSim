import { Bullet, BulletFactory, BulletOptions } from "space-sim-shared";

export class ServerBulletFactory extends BulletFactory<Bullet> {
    generate(options: BulletOptions): Bullet {
        return new Bullet(this.scene, options);
    }
}