import { BaseScene } from "../../../scenes/base-scene";
import { Bullet, BulletOptions } from "./bullet";

export abstract class BulletFactory<T extends Bullet> {
    public readonly scene: BaseScene;

    constructor(scene: BaseScene) {
        this.scene = scene;
    }

    abstract generate(options: BulletOptions): T;
}