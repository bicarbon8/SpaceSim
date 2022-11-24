import Dungeon, { Room } from "@mikewesthad/dungeon";
import { HasGameObject } from "../interfaces/has-game-object";
import { Ship } from "../ships/ship";
import { Constants } from "../utilities/constants";
import { Helpers } from "../utilities/helpers";
import { GameMapOptions } from "./game-map-options";

export type RoomPlus = Room & {
    visible?: boolean;
    opponents?: Array<Ship>;
};

export class GameMap implements HasGameObject<Phaser.Tilemaps.TilemapLayer> {
    private _scene: Phaser.Scene;
    private _dungeon: Dungeon;
    private _layer: Phaser.Tilemaps.TilemapLayer;
    private _tileMap: Phaser.Tilemaps.Tilemap;

    constructor(scene: Phaser.Scene, options?: GameMapOptions) {
        this._scene = scene;
        this._createGameObj(options);
    }

    getGameObject(): Phaser.Tilemaps.TilemapLayer {
        return this._layer;
    }

    getPhysicsBody(): Phaser.Physics.Arcade.Body {
        return this._layer.body as Phaser.Physics.Arcade.Body;
    }

    private _createGameObj(options: GameMapOptions): void {
        this._dungeon = new Dungeon({
            randomSeed: options?.seed ?? 'bicarbon8',
            width: options?.width ?? 200, // in tiles, not pixels
            height: options?.height ?? 200,
            rooms: {
                width: {
                    min: options?.roomMinWidth ?? 10, // in tiles, not pixels
                    max: options?.roomMaxWidth ?? 25,
                    onlyOdd: true
                },
                height: {
                    min: options?.roomMinHeight ?? 10,
                    max: options?.roomMaxHeight ?? 25,
                    onlyOdd: true
                },
                maxRooms: options?.maxRooms ?? 100
            },
            doorPadding: options?.doorPadding ?? 2
        });

        this._tileMap = this._scene.make.tilemap({
            tileWidth: 96,
            tileHeight: 96,
            width: this._dungeon.width,
            height: this._dungeon.height,
        });

        let tileset: Phaser.Tilemaps.Tileset = this._tileMap.addTilesetImage('tiles', 'metaltiles', 96, 96, 0, 0);
        this._layer = this._tileMap.createBlankLayer('Map Layer', tileset);
        this._layer.setDepth(options?.layerDepth ?? Constants.UI.Layers.PLAYER);

        this._dungeon.rooms.forEach(room => {
            const { x, y, width, height, left, right, top, bottom } = room;

            // top wall
            this._layer.weightedRandomize(Constants.UI.SpriteMaps.Tiles.Map.WALL, left, top, width, 1);
            // left wall
            this._layer.weightedRandomize(Constants.UI.SpriteMaps.Tiles.Map.WALL, left, top, 1, height);
            // bottom wall
            this._layer.weightedRandomize(Constants.UI.SpriteMaps.Tiles.Map.WALL, left, bottom, width, 1);
            // right wall
            this._layer.weightedRandomize(Constants.UI.SpriteMaps.Tiles.Map.WALL, right, top, 1, height);

            // Dungeons have rooms that are connected with doors. Each door has an x & y relative to the
            // room's location
            const doors = room.getDoorLocations();
            for (let i = 0; i < doors.length; i++) {
                if (doors[i].y === 0) {
                    this._layer.removeTileAt(x + doors[i].x - 1, y + doors[i].y);
                } else if (doors[i].y === room.height - 1) {
                    this._layer.removeTileAt(x + doors[i].x - 1, y + doors[i].y);
                } else if (doors[i].x === 0) {
                    this._layer.removeTileAt(x + doors[i].x, y + doors[i].y - 1);
                } else if (doors[i].x === room.width - 1) {
                    this._layer.removeTileAt(x + doors[i].x, y + doors[i].y - 1);
                }
            }
        });

        // hide all tiles until we enter the room
        this._layer.forEachTile(function (tile) { tile.alpha = 0; });
        this._layer.setCollisionBetween(1, 14);
    }

    getMapTileWorldLocation(tilePositionX: number, tilePositionY: number): Phaser.Math.Vector2 {
        return this._tileMap.tileToWorldXY(tilePositionX, tilePositionY);
    }

    getLayer(): Phaser.Tilemaps.TilemapLayer {
        return this._layer;
    }

    getRooms(): RoomPlus[] {
        return this._dungeon.rooms;
    }

    getRoomAt(tileX: number, tileY: number): RoomPlus {
        return this._dungeon.getRoomAt(tileX, tileY);
    }

    getRoomClosestToOrigin(): RoomPlus {
        const zero = Helpers.vector2();
        let closest: RoomPlus;
        this._dungeon.rooms.forEach(room => {
            if (closest) {
                const pos = this._tileMap.tileToWorldXY(closest.centerX, closest.centerY);
                const newPos = this._tileMap.tileToWorldXY(room.centerX, room.centerY);
                if (Phaser.Math.Distance.BetweenPoints(zero, newPos) < Phaser.Math.Distance.BetweenPoints(zero, pos)) {
                    closest = room;
                }
            } else {
                closest = room;
            }
        });
        return closest;
    }

    getRoomFurthestFromOrigin(): RoomPlus {
        const zero = Helpers.vector2();
        let furthest: RoomPlus;
        this._dungeon.rooms.forEach(room => {
            if (furthest) {
                const pos = this._tileMap.tileToWorldXY(furthest.centerX, furthest.centerY);
                const newPos = this._tileMap.tileToWorldXY(room.centerX, room.centerY);
                if (Phaser.Math.Distance.BetweenPoints(zero, newPos) > Phaser.Math.Distance.BetweenPoints(zero, pos)) {
                    furthest = room;
                }
            } else {
                furthest = room;
            }
        });
        return furthest;
    }

    showRoom(room: RoomPlus): void {
        if (!room.visible) {
            room.visible = true;
            this._scene.add.tween({
                targets: [
                    ...this._layer.getTilesWithin(room.x, room.y, room.width, room.height), 
                    ...room.opponents.map(o => o.getGameObject())
                ],
                alpha: 1,
                duration: 250
            });
        }
    }
}