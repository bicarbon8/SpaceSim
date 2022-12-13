import { ShipLike } from "../../interfaces/ship-like";
import { SpaceSim } from "../../space-sim";
import { NumberOrRange } from "../../interfaces/number-range";
import { Constants } from "../../utilities/constants";
import { Helpers } from "../../utilities/helpers";

export type ShipSupplyOptions = {
    readonly amount: number;
    location: Phaser.Types.Math.Vector2Like;
    rotation?: NumberOrRange;
    heading?: Phaser.Math.Vector2;
    speed?: NumberOrRange;
};

export abstract class ShipSupply extends Phaser.GameObjects.Container implements ShipSupplyOptions {
    readonly amount: number;
    
    constructor(scene: Phaser.Scene, options: ShipSupplyOptions) {
        super(scene, options.location.x, options.location.y);
        this.scene.add.existing(this);
        this.setDepth(Constants.UI.Layers.PLAYER);

        this.amount = options.amount;

        this._createChildren();

        this.updateSize();
        
        this.scene.physics.add.existing(this);
        this._body.setMass(0.1);
        this._body.setCircle(this.width / 2);
        this._body.setBounce(0.5, 0.5);
        this._body.setAngularVelocity(Helpers.getRealNumber(options.rotation) ?? Phaser.Math.RND.realInRange(-10, 10));
        const speed = Helpers.getRealNumber(options.speed) ?? Phaser.Math.RND.realInRange(50, 200);
        const heading = options.heading || Helpers.vector2(Phaser.Math.RND.realInRange(-1, 1), Phaser.Math.RND.realInRange(-1, 1));
        const velocity = heading.multiply({x: speed, y: speed});
        this._body.setVelocity(velocity.x, velocity.y);
        this.scene.physics.add.collider(this, SpaceSim.map.getGameObject());
        this.scene.physics.add.collider(this, SpaceSim.players
            .filter(p => p?.active)
            .map(o => o?.getGameObject()), (obj1, obj2) => {
                let shipGameObj: Phaser.GameObjects.Container;
                if (obj1 === this) {
                    shipGameObj = obj2 as Phaser.GameObjects.Container;
                } else {
                    shipGameObj = obj1 as Phaser.GameObjects.Container;
                }
                const ship: ShipLike = SpaceSim.players.find(p => {
                    const loc = p.getLocation();
                    if (shipGameObj.x === loc.x && shipGameObj.y === loc.y) {
                        return true;
                    }
                    return false;
                });
                this.apply(ship);
            }
        );
    }

    get location(): Phaser.Math.Vector2 {
        return this._body.center;
    }

    protected get _body(): Phaser.Physics.Arcade.Body {
        return this.body as Phaser.Physics.Arcade.Body;
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