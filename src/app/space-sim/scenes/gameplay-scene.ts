import { Vector2 } from "phaser/src/math";
import { ShipPod } from "../ships/ship-pod";
import { CannonAttachment } from "../ships/attachments/offence/cannon-attachment";
import { ThrusterAttachment } from "../ships/attachments/utility/thruster-attachment";
import { InputController } from "../controllers/input-controller";
import { TouchController } from "../controllers/touch-controller";
import { KbmController } from "../controllers/kbm-controller";
import { StellarBody } from "../star-systems/stellar-body";
import { GameMap } from "../map/game-map";
import { environment } from "../../../environments/environment";
import { Constants } from "../utilities/constants";
import { SpaceSim } from "../space-sim";
import { Helpers } from "../utilities/helpers";
import { Room } from "@mikewesthad/dungeon";
import { AttachmentLocation } from "../ships/attachments/attachment-location";
import { OffenceAttachment } from "../ships/attachments/offence/offence-attachment";
import { StellarBodyOptions } from "../star-systems/stellar-body-options";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'gameplay-scene'
};

export class GameplayScene extends Phaser.Scene {
    private _controller: InputController;
    private _hudText: Phaser.GameObjects.Text;
    private _stellarBodies: StellarBody[];

    debug: boolean;

    constructor(settingsConfig?: Phaser.Types.Scenes.SettingsConfig) {
        super(settingsConfig || sceneConfig);

        this.debug = SpaceSim.debug;
        this._stellarBodies = [];
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

        this.load.image('sun', `${environment.baseUrl}/assets/backgrounds/sun.png`);
        this.load.image('venus', `${environment.baseUrl}/assets/backgrounds/venus.png`);
        this.load.image('mercury', `${environment.baseUrl}/assets/backgrounds/mercury.png`);

        this.load.image('far-stars', `${environment.baseUrl}/assets/backgrounds/starfield-tile-512x512.png`);

        this.load.image('metaltiles', `${environment.baseUrl}/assets/tiles/metaltiles_lg.png`);
    }

    create(): void {
        this._createHUD();
        this._createMapAndPlayer();
        this._setupCamera();
        this._createController();
        this._createStellarBodiesLayer();
        this._createBackground();
        this._createOpponents();
    }

    update(time: number, delta: number): void {
        this._controller?.update(time, delta);
        SpaceSim.player?.update(time, delta);
        this._stellarBodies.forEach((body) => {
            body.update(time, delta);
        });
        this._displayHUDInfo();
    }

    private _createOpponents(): void {
        SpaceSim.map.getRooms().forEach((room: Room) => {
            var tl: Phaser.Math.Vector2 = SpaceSim.map.getMapTileWorldLocation(room.left + 1, room.top + 1);
            var br: Phaser.Math.Vector2 = SpaceSim.map.getMapTileWorldLocation(room.right - 1, room.bottom - 1);
            var pos: Phaser.Math.Vector2 = Helpers.vector2(
                Phaser.Math.RND.realInRange(tl.x, br.x), 
                Phaser.Math.RND.realInRange(tl.y, br.y)
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

    private _createHUD(): void {
        this._hudText = this.add.text(10, 10, '', { font: '12px Courier', fontStyle: 'color: #ffdddd' });
        this._hudText.setScrollFactor(0); // keep fixed in original location on screen
        this._hudText.setDepth(Constants.DEPTH_HUD);
    }

    private _createController(): void {
        if (this.game.device.os.desktop) {
            this._controller = new KbmController(this, SpaceSim.player);
        } else {
            this._controller = new TouchController(this, SpaceSim.player);
        }
    }

    private _createMapAndPlayer(): void {
        SpaceSim.map = new GameMap(this);
        
        // Place the player in random empty tile in the first room
        const startingRoom = SpaceSim.map.getRooms()[0];
        const startTopLeft: Phaser.Math.Vector2 = SpaceSim.map.getMapTileWorldLocation(startingRoom.left + 1, startingRoom.top + 1);
        const startBottomRight: Phaser.Math.Vector2 = SpaceSim.map.getMapTileWorldLocation(startingRoom.right - 1, startingRoom.bottom - 1);
        const playerStartingPosition: Phaser.Math.Vector2 = Helpers.vector2(
            Phaser.Math.RND.realInRange(startTopLeft.x, startBottomRight.x), 
            Phaser.Math.RND.realInRange(startTopLeft.y, startBottomRight.y)
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

        this.events.addListener('player-death', (ship: ShipPod) => {
            if (SpaceSim.player.id == ship?.id) {
                this.cameras.main.fadeOut(2000, 0, 0, 0, (camera: Phaser.Cameras.Scene2D.Camera, progress: number) => {
                    if (progress === 1) {
                        this.game.scene.start('game-over-scene');
                        this.game.scene.stop(this);
                    }
                });
            }
        })
    }

    private _createStellarBodiesLayer(): void {
        let rooms = SpaceSim.map.getRooms();
        let bodies: StellarBodyOptions[] = [
            {spriteName: 'sun'}, 
            {spriteName: 'venus', rotationSpeed: 0}, 
            {spriteName: 'mercury', rotationSpeed: 0}
        ];
        for (var i=0; i<rooms.length; i+=3) {
            let room = rooms[i];
            let startTopLeft: Phaser.Math.Vector2 = SpaceSim.map.getMapTileWorldLocation(room.left, room.top);
            let startBottomRight: Phaser.Math.Vector2 = SpaceSim.map.getMapTileWorldLocation(room.right, room.bottom);
            let location: Phaser.Math.Vector2 = Helpers.vector2(
                Phaser.Math.RND.realInRange(startTopLeft.x, startBottomRight.x), 
                Phaser.Math.RND.realInRange(startTopLeft.y, startBottomRight.y)
            );
            let opts: StellarBodyOptions = bodies[Phaser.Math.RND.between(0, 2)];
            opts.location = location;
            let body = new StellarBody(this, opts);
            this._stellarBodies.push(body);
        }
    }

    private _createBackground(): void {
        const width = this.game.canvas.width;
	    const height = this.game.canvas.height;
        const starField = this.add.tileSprite(width/2, height/2, width*3, height*3, 'far-stars');
        starField.setDepth(Constants.DEPTH_BACKGROUND);
        starField.setScrollFactor(0.01); // slight movement to appear very far away
    }

    private _setupCamera(): void {
        this.cameras.main.backgroundColor.setFromRGB({r: 0, g: 0, b: 0});
        
        this.cameras.main.setZoom(1);
        let playerLoc: Vector2 = SpaceSim.player.getLocation();
        this.cameras.main.centerOn(playerLoc.x, playerLoc.y);

        this.cameras.main.startFollow(SpaceSim.player.getGameObject(), true, 1, 1);
    }

    private _displayHUDInfo(): void {
        let loc: Phaser.Math.Vector2 = SpaceSim.player.getLocation();
        let info: string[] = [
            `Speed: ${SpaceSim.player.getSpeed().toFixed(1)}`,
            `Integrity: ${SpaceSim.player.getIntegrity().toFixed(1)}`,
            `Heat: ${SpaceSim.player.getTemperature().toFixed(1)}`,
            `Fuel: ${SpaceSim.player.getRemainingFuel().toFixed(1)}`,
            `Ammo: ${(SpaceSim.player.attachments.getAttachmentAt(AttachmentLocation.front) as OffenceAttachment)?.getRemainingAmmo()}`
        ];
        if (SpaceSim.debug) {
            info.push(`Location: ${loc.x.toFixed(1)},${loc.y.toFixed(1)}`);
        }
        this._hudText.setText(info);
    }
}