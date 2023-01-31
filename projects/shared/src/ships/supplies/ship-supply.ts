import { IsConfigurable } from "../../interfaces/is-configurable";
import { PhysicsObject } from "../../interfaces/physics-object";
import { HasId } from "../../interfaces/has-id";
import { SupplyType } from "./supply-type";
import { BaseScene } from "../../scenes/base-scene";
import { Ship } from "../ship";
import { SpaceSim } from "../../space-sim";
import { Helpers } from "../../utilities/helpers";

export type ShipSupplyOptions = Partial<PhysicsObject> & {
    readonly id?: string;
    readonly amount: number;
    readonly supplyType: SupplyType;
};

export abstract class ShipSupply extends Phaser.GameObjects.Container implements HasId, IsConfigurable<ShipSupplyOptions> {
    private _id: string;
    private _amount: number;
    private _type: SupplyType;

    // override property types
    public scene: BaseScene
    public body: Phaser.Physics.Arcade.Body;
    
    constructor(scene: BaseScene, options: ShipSupplyOptions) {
        super(scene, options.location.x, options.location.y);
        this.scene.add.existing(this);
        const radius = SpaceSim.Constants.Ships.Supplies.RADIUS;
        this.setSize(radius * 2, radius * 2);
        this.scene.physics.add.existing(this);
        this.body.setMass(SpaceSim.Constants.Ships.Supplies.MASS);
        this.body.setCircle(radius);
        this.body.setBounce(SpaceSim.Constants.Ships.Supplies.BOUNCE, SpaceSim.Constants.Ships.Supplies.BOUNCE);

        this.configure(options);
    }

    get config(): ShipSupplyOptions {
        return {
            id: this.id,
            amount: this.amount,
            supplyType: this.supplyType,
            location: {x: this.x, y: this.y},
            velocity: {x: this.body?.velocity?.x ?? 0, y: this.body?.velocity?.y ?? 0},
            angle: this.angle,
            angularVelocity: this.body?.angularVelocity
        };
    }

    get id(): string {
        return this._id;
    }

    get amount(): number {
        return this._amount;
    }

    get supplyType(): SupplyType {
        return this._type;
    }

    get location(): Phaser.Math.Vector2 {
        return this.body.center;
    }

    configure(config: ShipSupplyOptions): this {
        this._id = config.id ?? Phaser.Math.RND.uuid();
        this._amount = config.amount ?? 1;
        this._type = config.supplyType;
        const loc = config.location ?? Helpers.vector2();
        this.setPosition(loc.x, loc.y);
        this.setAngle(config.angle ?? 0);
        const speed = Phaser.Math.RND.realInRange(50, 200);
        const heading = Helpers.vector2(Phaser.Math.RND.realInRange(-1, 1), Phaser.Math.RND.realInRange(-1, 1));
        const velocity = config.velocity || heading.multiply({x: speed, y: speed});
        this.body.setVelocity(velocity.x, velocity.y);
        this.body.setAngularVelocity(config.angularVelocity ?? 0);
        return this;
    }

    abstract apply(ship: Ship): void;
}