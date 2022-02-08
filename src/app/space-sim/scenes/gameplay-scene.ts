import { Vector2 } from "phaser/src/math";
import { ShipPod } from "../ships/ship-pod";
import { CannonAttachment } from "../ships/attachments/offence/cannon-attachment";
import { ThrusterAttachment } from "../ships/attachments/utility/thruster-attachment";
import { InputController } from "../controllers/input-controller";
import { TouchController } from "../controllers/touch-controller";
import { KbmController } from "../controllers/kbm-controller";
import { ShipAttachment } from "../ships/attachments/ship-attachment";
import { AttachmentLocation } from "../ships/attachments/attachment-location";
import { SystemBody } from "../star-systems/system-body";
import { GameMap } from "../map/game-map";
import { environment } from "../../../environments/environment";
import { Constants } from "../utilities/constants";
import { SpaceSim } from "../space-sim";
import { Helpers } from "../utilities/helpers";
import { Room } from "@mikewesthad/dungeon";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: true,
    visible: true,
    key: 'GameplayScene'
};

export class GameplayScene extends Phaser.Scene {
    private _solarSystemBodies: SystemBody[];
    private _controller: InputController;
    private _debugLayer: Phaser.GameObjects.Layer;
    private _debugGroup: Phaser.GameObjects.Group;
    private _foregroundLayer: Phaser.GameObjects.Layer;
    private _foregroundGroup: Phaser.GameObjects.Group;
    private _midgroundLayer: Phaser.GameObjects.Layer;
    private _midgroundGroup: Phaser.GameObjects.Group;
    private _starSystemLayer: Phaser.GameObjects.Layer;
    private _starSystemGroup: Phaser.GameObjects.Group;
    private _backgroundLayer: Phaser.GameObjects.Layer;
    private _backgroundGroup: Phaser.GameObjects.Group;
    private _debugText: Phaser.GameObjects.Text;

    debug: boolean;

    constructor(settingsConfig?: Phaser.Types.Scenes.SettingsConfig) {
        let conf: Phaser.Types.Scenes.SettingsConfig = settingsConfig || sceneConfig;
        super(conf);

        this._solarSystemBodies = [];

        this.debug = true;
    }

    preload(): void {
        this.load.image('ship-pod', `${environment.baseUrl}/assets/sprites/ship-pod.png`);
        this.load.image('thruster', `${environment.baseUrl}/assets/sprites/thruster.png`);
        this.load.image('cannon', `${environment.baseUrl}/assets/sprites/cannon.png`);
        this.load.spritesheet('flares', `${environment.baseUrl}/assets/particles/flares.png`, {
            frameWidth: 130,
            frameHeight: 132,
            startFrame: 0,
            endFrame: 4
        });
        this.load.image('explosion', `${environment.baseUrl}/assets/particles/explosion.png`);
        this.load.image('bullet', `${environment.baseUrl}/assets/sprites/bullet.png`);
        this.load.image('box', `${environment.baseUrl}/assets/sprites/box.png`);

        this.load.image('metaltiles', `${environment.baseUrl}/assets/tiles/metaltiles_lg.png`);

        this.load.image('sun', `${environment.baseUrl}/assets/backgrounds/sun.png`);

        this.load.image('far-stars', `${environment.baseUrl}/assets/backgrounds/starfield-tile-512x512.png`);
    }

    create(): void {
        this._createDebugLayer();
        this._createPlayerLayer();
        this._createHUDLayer();
        this._createStarSystemLayer();
        this._createBackgroundLayer();
    }

    update(time: number, delta: number): void {
        this._controller?.update(time, delta);
        SpaceSim.player?.update(time, delta);
        this._updateStarSystemObjects(time, delta);
        if (this.debug) {
            this._displayDebugInfo();
        }
        this._offsetDebugObjects();
        this._offsetForegroundObjects();
        this._offsetBackgroundObjects();
    }

    private _updateStarSystemObjects(time: number, delta: number): void {
        this._solarSystemBodies.forEach((systemBody: SystemBody) => {
            systemBody.update(time, delta);
        });
    }

    private _offsetDebugObjects(): void {
        let offset: Phaser.Math.Vector2 = this.cameras.main.getWorldPoint(10, 10);
        this._debugGroup.setXY(offset.x, offset.y);
    }

    private _offsetForegroundObjects(): void {
        let offset: Phaser.Math.Vector2 = this.cameras.main.getWorldPoint(0, 0);
        this._foregroundGroup.setXY(offset.x, offset.y);
    }

    private _offsetBackgroundObjects(): void {
        let offset: Phaser.Math.Vector2 = this.cameras.main.getWorldPoint(Math.ceil(this.game.canvas.width / 2), Math.ceil(this.game.canvas.height / 2));
        this._backgroundGroup.setXY(offset.x, offset.y);
    }

    private _createPlayer(): void {
        // Place the player in random empty tile in the first room
        const startingRoom = SpaceSim.map.getRooms()[0];
        const startTopLeft: Phaser.Math.Vector2 = SpaceSim.map.getMapTileWorldLocation(startingRoom.left + 1, startingRoom.top + 1);
        const startBottomRight: Phaser.Math.Vector2 = SpaceSim.map.getMapTileWorldLocation(startingRoom.right - 1, startingRoom.bottom - 1);
        const playerStartingPosition: Phaser.Math.Vector2 = Helpers.vector2(
            Phaser.Math.Between(startTopLeft.x, startBottomRight.x), 
            Phaser.Math.Between(startTopLeft.y, startBottomRight.y)
        );
        SpaceSim.player = new ShipPod(this, {location: playerStartingPosition});
        
        // TODO: have menu allowing selection of attachments
        let thruster: ThrusterAttachment = new ThrusterAttachment(this);
        SpaceSim.player.attachments.addAttachment(thruster);
        let cannon: CannonAttachment = new CannonAttachment(this);
        SpaceSim.player.attachments.addAttachment(cannon);

        this.physics.add.collider(SpaceSim.player.getGameObject(), SpaceSim.map.getGameObject(), () => {
            SpaceSim.player.sustainDamage((SpaceSim.player.getSpeed() / Constants.MAX_VELOCITY) * (Constants.MAX_INTEGRITY / 33));
        });
    }

    private _createOpponents(): void {
        SpaceSim.map.getRooms().forEach((room: Room) => {
            var tl: Phaser.Math.Vector2 = SpaceSim.map.getMapTileWorldLocation(room.left + 1, room.top + 1);
            var br: Phaser.Math.Vector2 = SpaceSim.map.getMapTileWorldLocation(room.right - 1, room.bottom - 1);
            var pos: Phaser.Math.Vector2 = Helpers.vector2(
                Phaser.Math.Between(tl.x, br.x), 
                Phaser.Math.Between(tl.y, br.y)
            );
            var p: ShipPod = new ShipPod(this, {location: pos});
            SpaceSim.opponents.push(p);

            this.physics.add.collider(p.getGameObject(), SpaceSim.map.getGameObject(), () => {
                p.sustainDamage((p.getSpeed() / Constants.MAX_VELOCITY) * (Constants.MAX_INTEGRITY / 33));
            });
            this.physics.add.collider(p.getGameObject(), SpaceSim.player.getGameObject(), () => {
                p.sustainDamage(1); // TODO: set based on opposing speeds
                SpaceSim.player.sustainDamage(1);
            });
        });
    }

    private _createMap(layerDepth: number): void {
        SpaceSim.map = new GameMap(this, layerDepth);
    }

    private _createDebugLayer(): void {
        this._debugLayer = this.add.layer();
        this._debugLayer.setName('debug');
        this._debugLayer.depth = 4;

        this._debugGroup = this.add.group();

        this._debugText = this.add.text(10, 10, '', { font: '16px Courier', fontStyle: 'color: #ffdddd' });

        this._debugGroup.add(this._debugText);
        this._debugLayer.add(this._debugText);
    }

    private _createHUDLayer(): void {
        this._foregroundLayer = this.add.layer();
        this._foregroundLayer.setName('foreground');
        this._foregroundLayer.depth = 3;

        this._foregroundGroup = this.add.group();

        if (this.game.device.os.desktop) {
            this._controller = new KbmController(this, SpaceSim.player);
        } else {
            this._controller = new TouchController(this, SpaceSim.player);
            this._foregroundGroup.add((this._controller as TouchController).getGameObject());
            this._foregroundLayer.add((this._controller as TouchController).getGameObject());
        }
    }

    private _createPlayerLayer(): void {
        this._midgroundLayer = this.add.layer();
        this._midgroundLayer.setName('midground');
        this._midgroundLayer.depth = 2;

        this._midgroundGroup = this.add.group();

        this._createMap(this._midgroundLayer.depth);
        this._createPlayer();
        this._setupCamera();
        this._createOpponents();
        
        this._midgroundGroup.add(SpaceSim.player.getGameObject());
        this._midgroundLayer.add(SpaceSim.player.getGameObject());
    }

    private _createStarSystemLayer(): void {
        this._starSystemLayer = this.add.layer();
        this._starSystemLayer.setName('starsystem');
        this._starSystemLayer.depth = 1;

        this._starSystemGroup = this.add.group();

        // TODO: support multiple large stars and planets
        this._solarSystemBodies.push(new SystemBody(this, SpaceSim.player, {spriteName: 'sun'}));

        this._solarSystemBodies.forEach((body: SystemBody) => {
            this._starSystemGroup.add(body.getGameObject());
            this._starSystemLayer.add(body.getGameObject());
        });
    }

    private _createBackgroundLayer(): void {
        this._backgroundLayer = this.add.layer();
        this._backgroundLayer.setName('background');
        this._backgroundLayer.depth = 0;

        this._backgroundGroup = this.add.group();

        let xOffset: number = Math.ceil(this.game.canvas.width / 2);
        let yOffset: number = Math.ceil(this.game.canvas.height / 2);
        let starField = this.add.tileSprite(xOffset, yOffset, this.game.canvas.width, this.game.canvas.height, 'far-stars');

        this._backgroundGroup.add(starField);
        this._backgroundLayer.add(starField);
    }

    private _setupCamera(): void {
        this.cameras.main.backgroundColor.setFromRGB({r: 0, g: 0, b: 0});
        
        this.cameras.main.setZoom(1);
        let playerLoc: Vector2 = SpaceSim.player.getLocation();
        this.cameras.main.centerOn(playerLoc.x, playerLoc.y);

        this.cameras.main.startFollow(SpaceSim.player.getGameObject(), true, 1, 1);
    }

    private _displayDebugInfo(): void {
        let loc: Phaser.Math.Vector2 = SpaceSim.player.getLocation();
        let v: Phaser.Math.Vector2 = SpaceSim.player.getVelocity();
        let info: string[] = [
            `Speed: ${SpaceSim.player.getSpeed().toFixed(1)}`,
            `Integrity: ${SpaceSim.player.getIntegrity().toFixed(1)}`,
            `Heat: ${SpaceSim.player.getTemperature().toFixed(1)}`,
            `Fuel: ${SpaceSim.player.getRemainingFuel().toFixed(1)}`,
            `Location: ${loc.x.toFixed(1)},${loc.y.toFixed(1)}`,
            `Angle: ${SpaceSim.player.getRotation().toFixed(1)}`,
            `Velocity: ${v.x.toFixed(1)},${v.y.toFixed(1)}`
        ];
        let attachments: ShipAttachment[] = SpaceSim.player.attachments.getAttachments();
        for (var i=0; i<attachments.length; i++) {
            if (attachments[i]) {
                info.push(`AttachmentLocation.${AttachmentLocation[i]} - ${i}`);
                let attLoc: Phaser.Math.Vector2 = attachments[i].getLocation();
                info.push(`-- Location: ${attLoc.x.toFixed(1)},${attLoc.y.toFixed(1)}`);
                info.push(`-- Angle: ${attachments[i].getRotation().toFixed(1)}`);
            }
        }
        this._debugText.setText(info);
    }
}