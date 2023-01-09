import { ShipLike } from "../../interfaces/ship-like";
import { SpaceSim } from "../../space-sim";
import { Constants } from "../../utilities/constants";
import { IsConfigurable } from "../../interfaces/is-configurable";
import { PhysicsObject } from "../../interfaces/physics-object";
import { HasId } from "../../interfaces/has-id";
import { SupplyType } from "./supply-type";
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
    
    constructor(scene: Phaser.Scene, options: ShipSupplyOptions) {
        super(scene, options.location.x, options.location.y);
        this.scene.add.existing(this);
        this.setDepth(Constants.UI.Layers.PLAYER);

        this._createChildren();

        this.updateSize();
        
        this.scene.physics.add.existing(this);
        this._body.setMass(0.1);
        this._body.setCircle(this.width / 2);
        this._body.setBounce(0.5, 0.5);

        this.configure(options);

        if (SpaceSim.map) {
            this.scene.physics.add.collider(this, SpaceSim.map?.getGameObject());
        }
    }

    get config(): ShipSupplyOptions {
        return {
            id: this.id,
            amount: this.amount,
            supplyType: this.supplyType,
            location: {x: this.x, y: this.y},
            velocity: {x: this._body.velocity?.x ?? 0, y: this._body.velocity?.y ?? 0},
            angle: this.angle,
            angularVelocity: this._body.angularVelocity
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
        return this._body.center;
    }

    protected get _body(): Phaser.Physics.Arcade.Body {
        return this.body as Phaser.Physics.Arcade.Body;
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
        this._body.setVelocity(velocity.x, velocity.y);
        this._body.setAngularVelocity(config.angularVelocity ?? 0);
        return this;
    }

    protected abstract _createChildren(): this;

    abstract apply(ship: ShipLike): void;

    updateSize(): this {
        const bounds: Phaser.Geom.Rectangle = this.getBounds();

        //set the container size
        this.setSize(bounds.width, bounds.height);

        return this;
    }
}