import Dungeon, { Room } from "@mikewesthad/dungeon";
import { HasGameObject } from "../interfaces/has-game-object";
import { Constants } from "../utilities/constants";
import { Helpers } from "../utilities/helpers";
import { GameMapOptions } from "./game-map-options";

export class GameMap implements HasGameObject<Phaser.Tilemaps.TilemapLayer> {
    private _scene: Phaser.Scene;
    private _dungeon: Dungeon;
    private _layer: Phaser.Tilemaps.TilemapLayer;
    private _tileMap: Phaser.Tilemaps.Tilemap;

    constructor(options: GameMapOptions) {
        this._scene = options.scene;
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
            randomSeed: options.seed ?? 'bicarbon8',
            width: options.width ?? 200, // in tiles, not pixels
            height: options.height ?? 200,
            rooms: {
                width: {
                    min: options.roomMinWidth ?? 10, // in tiles, not pixels
                    max: options.roomMaxWidth ?? 25,
                    onlyOdd: true
                },
                height: {
                    min: options.roomMinHeight ?? 10,
                    max: options.roomMaxHeight ?? 25,
                    onlyOdd: true
                },
                maxRooms: options.maxRooms ?? 100
            },
            doorPadding: options.doorPadding ?? 2
        });

        this._tileMap = this._scene.make.tilemap({
            tileWidth: 96,
            tileHeight: 96,
            width: this._dungeon.width,
            height: this._dungeon.height,
        });

        let tileset: Phaser.Tilemaps.Tileset = this._tileMap.addTilesetImage('tiles', 'metaltiles', 96, 96, 0, 0);
        this._layer = this._tileMap.createBlankLayer('Map Layer', tileset);
        this._layer.setDepth(options.layerDepth ?? Constants.UI.Layers.PLAYER);

        this._dungeon.rooms.forEach(room => {
          const { x, y, width, height, left, right, top, bottom } = room;

          this._layer.weightedRandomize(Constants.UI.SpriteMaps.Tiles.Map.FLOOR, x, y, width, height);

          // Place the room corners tiles
          this._layer.putTileAt(Constants.UI.SpriteMaps.Tiles.Map.WALL.TOP_LEFT, left, top);
          this._layer.putTileAt(Constants.UI.SpriteMaps.Tiles.Map.WALL.TOP_RIGHT, right, top);
          this._layer.putTileAt(Constants.UI.SpriteMaps.Tiles.Map.WALL.BOTTOM_RIGHT, right, bottom);
          this._layer.putTileAt(Constants.UI.SpriteMaps.Tiles.Map.WALL.BOTTOM_LEFT, left, bottom);

          this._layer.weightedRandomize(Constants.UI.SpriteMaps.Tiles.Map.WALL.TOP, left + 1, top, width - 2, 1);
          this._layer.weightedRandomize(Constants.UI.SpriteMaps.Tiles.Map.WALL.BOTTOM, left + 1, bottom, width - 2, 1);
          this._layer.weightedRandomize(Constants.UI.SpriteMaps.Tiles.Map.WALL.LEFT, left, top + 1, 1, height - 2);
          this._layer.weightedRandomize(Constants.UI.SpriteMaps.Tiles.Map.WALL.RIGHT, right, top + 1, 1, height - 2);

          // Dungeons have rooms that are connected with doors. Each door has an x & y relative to the
          // room's location
          const doors = room.getDoorLocations();
          for (let i = 0; i < doors.length; i++) {
            if (doors[i].y === 0) {
              this._layer.putTilesAt(Constants.UI.SpriteMaps.Tiles.Map.DOOR.TOP, x + doors[i].x - 1, y + doors[i].y);
            } else if (doors[i].y === room.height - 1) {
              this._layer.putTilesAt(Constants.UI.SpriteMaps.Tiles.Map.DOOR.BOTTOM, x + doors[i].x - 1, y + doors[i].y);
            } else if (doors[i].x === 0) {
              this._layer.putTilesAt(Constants.UI.SpriteMaps.Tiles.Map.DOOR.LEFT, x + doors[i].x, y + doors[i].y - 1);
            } else if (doors[i].x === room.width - 1) {
              this._layer.putTilesAt(Constants.UI.SpriteMaps.Tiles.Map.DOOR.RIGHT, x + doors[i].x, y + doors[i].y - 1);
            }
          }
        });

        this._layer.setCollisionByExclusion([-1, 0, 7]);
    }

    getMapTileWorldLocation(tilePositionX: number, tilePositionY: number): Phaser.Math.Vector2 {
        return this._tileMap.tileToWorldXY(tilePositionX, tilePositionY);
    }

    getLayer(): Phaser.Tilemaps.TilemapLayer {
        return this._layer;
    }

    getRooms(): Room[] {
        return this._dungeon.rooms;
    }

    getRoomClosestToOrigin(): Room {
        const zero = Helpers.vector2();
        let closest: Room;
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

    getRoomFurthestFromOrigin(): Room {
        const zero = Helpers.vector2();
        let furthest: Room;
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
}