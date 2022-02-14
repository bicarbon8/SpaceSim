import Dungeon, { Room } from "@mikewesthad/dungeon";
import { HasGameObject } from "../interfaces/has-game-object";
import { Constants } from "../utilities/constants";
import { GameMapOptions } from "./game-map-options";
import TILE_MAPPING from "./tile-mapping";

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
            randomSeed: 'bicarbon8',
            width: 500, // in tiles, not pixels
            height: 500,
            rooms: {
                width: {
                    min: 10, // in tiles, not pixels
                    max: 25,
                    onlyOdd: true
                },
                height: {
                    min: 10,
                    max: 25,
                    onlyOdd: true
                }
            },
            doorPadding: 2
        });

        this._tileMap = this._scene.make.tilemap({
            tileWidth: 96,
            tileHeight: 96,
            width: this._dungeon.width,
            height: this._dungeon.height,
        });

        let tileset: Phaser.Tilemaps.Tileset = this._tileMap.addTilesetImage('tiles', 'metaltiles', 96, 96, 0, 0);
        this._layer = this._tileMap.createBlankLayer('Map Layer', tileset);
        this._layer.setDepth(options?.layerDepth || Constants.DEPTH_PLAYER);

        this._dungeon.rooms.forEach(room => {
          const { x, y, width, height, left, right, top, bottom } = room;

          this._layer.weightedRandomize(TILE_MAPPING.FLOOR, x, y, width, height);

          // Place the room corners tiles
          this._layer.putTileAt(TILE_MAPPING.WALL.TOP_LEFT, left, top);
          this._layer.putTileAt(TILE_MAPPING.WALL.TOP_RIGHT, right, top);
          this._layer.putTileAt(TILE_MAPPING.WALL.BOTTOM_RIGHT, right, bottom);
          this._layer.putTileAt(TILE_MAPPING.WALL.BOTTOM_LEFT, left, bottom);

          this._layer.weightedRandomize(TILE_MAPPING.WALL.TOP, left + 1, top, width - 2, 1);
          this._layer.weightedRandomize(TILE_MAPPING.WALL.BOTTOM, left + 1, bottom, width - 2, 1);
          this._layer.weightedRandomize(TILE_MAPPING.WALL.LEFT, left, top + 1, 1, height - 2);
          this._layer.weightedRandomize(TILE_MAPPING.WALL.RIGHT, right, top + 1, 1, height - 2);

          // Dungeons have rooms that are connected with doors. Each door has an x & y relative to the
          // room's location
          const doors = room.getDoorLocations();
          for (let i = 0; i < doors.length; i++) {
            if (doors[i].y === 0) {
              this._layer.putTilesAt(TILE_MAPPING.DOOR.TOP, x + doors[i].x - 1, y + doors[i].y);
            } else if (doors[i].y === room.height - 1) {
              this._layer.putTilesAt(TILE_MAPPING.DOOR.BOTTOM, x + doors[i].x - 1, y + doors[i].y);
            } else if (doors[i].x === 0) {
              this._layer.putTilesAt(TILE_MAPPING.DOOR.LEFT, x + doors[i].x, y + doors[i].y - 1);
            } else if (doors[i].x === room.width - 1) {
              this._layer.putTilesAt(TILE_MAPPING.DOOR.RIGHT, x + doors[i].x, y + doors[i].y - 1);
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
}