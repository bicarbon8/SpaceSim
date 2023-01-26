import * as Phaser from "phaser";
import Dungeon, { Room } from "@mikewesthad/dungeon";
import { Constants } from "../utilities/constants";
import { Helpers } from "../utilities/helpers";
import { Ship } from "../ships/ship";
import { BaseScene } from "../scenes/base-scene";
import { NumberOrRange } from "../interfaces/number-range";

export type RoomPlus = Room & {
    visible?: boolean;
};

export type GameLevelOptions = {
    width?: number;
    height?: number;
    seed?: string;
    roomWidth?: NumberOrRange;
    roomHeight?: NumberOrRange;
    doorPadding?: number;
    maxRooms?: number;
    tileWidth?: number;
    tileHeight?: number;
};

export class GameLevel extends Phaser.Tilemaps.Tilemap {
    public scene: BaseScene;

    private readonly _dungeon: Dungeon;

    private _wallsLayer: Phaser.Tilemaps.TilemapLayer;
    private _radarLayer: Phaser.Tilemaps.TilemapLayer;

    constructor(scene: BaseScene, options?: GameLevelOptions) {
        options = {
            seed: 'bicarbon8',
            width: 200, // in tiles, not pixels
            height: 200,
            roomWidth: {min: 10, max: 25}, // in tiles, not pixels
            roomHeight: {min: 25, max: 25},
            doorPadding: 2,
            maxRooms: 100,
            tileWidth: 96,
            tileHeight: 96,
            ...options
        };
        super(scene, new Phaser.Tilemaps.MapData({
            tileWidth: 96,
            tileHeight: 96,
            width: options.width,
            height: options.height
        }));
        this._dungeon = this._createDungeon(options);
        this._createLayers();
    }

    setAlpha(alpha: number): this {
        this._wallsLayer.forEachTile(tile => tile.setAlpha(alpha));
        this._radarLayer.forEachTile(tile => tile.setAlpha(alpha));
        return this;
    }

    get wallsLayer(): Phaser.Tilemaps.TilemapLayer {
        return this._wallsLayer;
    }

    get radarLayer(): Phaser.Tilemaps.TilemapLayer {
        return this._radarLayer;
    }

    get rooms(): RoomPlus[] {
        return this._dungeon.rooms;
    }

    getMapTileWorldLocation(tilePositionX: number, tilePositionY: number): Phaser.Math.Vector2 {
        return this.tileToWorldXY(tilePositionX, tilePositionY, null, this.scene.cameras.main, this._radarLayer);
    }

    isWithinTile(worldLocation: Phaser.Types.Math.Vector2Like, tilePosition: Phaser.Types.Math.Vector2Like): boolean {
        const tileLoc = this.getTileAtWorldXY(worldLocation.x, worldLocation.y, false, this.scene.cameras.main, this._radarLayer);
        if (tileLoc) {
            if (tileLoc.x === tilePosition.x && tileLoc.y === tilePosition.y) {
                return true;
            }
        }
        return false;
    }

    getRoomAt(tileX: number, tileY: number): RoomPlus {
        return this._dungeon.getRoomAt(tileX, tileY);
    }

    getRoomAtWorldXY(x: number, y: number): RoomPlus {
        const tile = this._wallsLayer?.worldToTileXY(x, y);
        return this.getRoomAt(tile.x, tile.y);
    }

    getRoomClosestToOrigin(): RoomPlus {
        const zero = Helpers.vector2();
        let closest: RoomPlus;
        this._dungeon.rooms.forEach(room => {
            if (closest) {
                const pos = this.tileToWorldXY(closest.centerX, closest.centerY);
                const newPos = this.tileToWorldXY(room.centerX, room.centerY);
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
                const pos = this.tileToWorldXY(furthest.centerX, furthest.centerY);
                const newPos = this.tileToWorldXY(room.centerX, room.centerY);
                if (Phaser.Math.Distance.BetweenPoints(zero, newPos) > Phaser.Math.Distance.BetweenPoints(zero, pos)) {
                    furthest = room;
                }
            } else {
                furthest = room;
            }
        });
        return furthest;
    }

    getActiveShipsWithinRadius(location: Phaser.Types.Math.Vector2Like, radius: number): Array<Ship> {
        return this.scene.getShips()
            .filter(s => {
                if (s?.active) {
                    if (Phaser.Math.Distance.BetweenPoints(s.location, location) <= radius) {
                        return true;
                    }
                }
                return false;
            });
    }

    /**
     * takes in a starting and ending position in world coordinates and returns a queue of tile
     * positions to follow
     * @param start a world location for the starting position
     * @param end a world location for the deisired ending position
     * @returns an array of world locations (not tile) that form a valid path to the `end`
     */
    findPathTo(start: Phaser.Types.Math.Vector2Like, end: Phaser.Types.Math.Vector2Like): Array<Phaser.Types.Math.Vector2Like> {
        const startTileLoc = this.getTileAtWorldXY(start.x, start.y, true, this.scene.cameras.main, this._radarLayer);
        const endTileLoc = this.getTileAtWorldXY(end.x, end.y, true, this.scene.cameras.main, this._radarLayer);
        // no path if select invalid tile
        if (!this._radarLayer.getTileAt(endTileLoc.x, endTileLoc.y)) {
            return null; // no path
        }
        // no path if select a wall
        if (this._wallsLayer.getTileAt(endTileLoc.x, endTileLoc.y)) {
            return null; // no path
        }

        const toKey = (loc: Phaser.Types.Math.Vector2Like) => `${loc.x}x${loc.y}`;
        type TilePosition = {key: string, position: Phaser.Types.Math.Vector2Like};
        const queue = new Array<Phaser.Types.Math.Vector2Like>();
        const parentForKey = new Map<string, TilePosition>();

        const startKey = toKey(startTileLoc);
        const targetKey = toKey(endTileLoc);
        parentForKey.set(startKey, null); // no parent for starting location so we end

        queue.push(startTileLoc)

        while (queue.length > 0) {
            const currentLoc = queue.shift();
            const currentKey = toKey(currentLoc);

            if (currentKey === targetKey) {
                break
            }

            const neighbors = [
                { x: currentLoc.x, y: currentLoc.y - 1 },	// top
                { x: currentLoc.x + 1, y: currentLoc.y }, 	// right
                { x: currentLoc.x, y: currentLoc.y + 1 },	// bottom
                { x: currentLoc.x - 1, y: currentLoc.y}		// left
            ];

            for (let i = 0; i < neighbors.length; ++i) {
                const neighbor = neighbors[i];
                const key = toKey(neighbor);
                const tile = this._radarLayer.getTileAt(neighbor.x, neighbor.y);
                const wall = this._wallsLayer.getTileAt(neighbor.x, neighbor.y);

                if (tile == null || wall != null || parentForKey.has(key)) {
                    continue; // either no tile, a wall or we already have this path
                }

                parentForKey.set(key, {
                    key: currentKey,
                    position: { x: currentLoc.x, y: currentLoc.y }
                });
                queue.push(neighbor);
            }
        }

        const path = new Array<Phaser.Types.Math.Vector2Like>();

        let currentKey = targetKey
        let currentPos = parentForKey.get(targetKey)?.position

        while (currentKey !== startKey) {
            const pos = this._radarLayer.tileToWorldXY(currentPos.x, currentPos.y)
            pos.x += this._radarLayer.tilemap.tileWidth * 0.5
            pos.y += this._radarLayer.tilemap.tileHeight * 0.5

            path.push(pos)

            const tilePosition = parentForKey.get(currentKey);
            if (!tilePosition) {
                break; // we've reached the start
            }
            currentKey = tilePosition.key;
            currentPos = tilePosition.position;
        }

        return path.reverse();
    }

    /**
     * performs a ray cast to determine if any walls are between the
     * start and end locations
     * @param start the observer location in world coordinates
     * @param end the target location in world coordinates
     * @returns true if a wall is obscuring the view between the `start`
     * and `end` locations
     */
    isWallObscuring(start: Phaser.Types.Math.Vector2Like, end: Phaser.Types.Math.Vector2Like): boolean {
        const ray = new Phaser.Geom.Line(start.x, start.y, end.x, end.y);
        // TODO: doesn't work due to https://github.com/photonstorm/phaser/issues/5640
        // const wallTiles = this.getTilesWithinShape(ray, {
        //         isColliding: true
        //     }, this.scene.cameras.main, this._wallsLayer);
        
        const rayPoints = ray.getPoints(0, 5);
        const wallTiles = new Array<Phaser.Tilemaps.Tile>();
        for (let p of rayPoints) {
            const tile = this.getTileAtWorldXY(p.x, p.y, false, this.scene.cameras.main, this._wallsLayer);
            if (tile) {
                wallTiles.push(tile);
            }
        }
        if (wallTiles?.length) {
            return true;
        }
        return false;
    }

    private _createDungeon(options: GameLevelOptions): Dungeon {
        const doorPadding = options.doorPadding;
        const dungeon = new Dungeon({
            randomSeed: options.seed,
            width: options.width, // in tiles, not pixels
            height: options.height,
            rooms: {
                width: {
                    min: NumberOrRange.min(options.roomWidth), // in tiles, not pixels
                    max: NumberOrRange.max(options.roomWidth),
                },
                height: {
                    min: NumberOrRange.min(options.roomHeight), // in tiles, not pixels
                    max: NumberOrRange.max(options.roomHeight),
                },
                maxRooms: options.maxRooms
            },
            doorPadding: doorPadding
        });
        return dungeon;
    }

    private _createLayers(): void {
        const wallsTileSet: Phaser.Tilemaps.Tileset = this.addTilesetImage('tiles', 'metaltiles', 96, 96, 0, 0);
        this._wallsLayer = this.createBlankLayer('walls', wallsTileSet);
        const radarTileSet = this.addTilesetImage('minimaptile', 'minimaptile', 96, 96, 0, 0);
        this._radarLayer = this.createBlankLayer('radar', radarTileSet);
        
        this._dungeon.rooms.forEach(room => {
            const { x, y, width, height, left, right, top, bottom } = room;

            // top wall
            this._wallsLayer.weightedRandomize(Constants.UI.SpriteMaps.Tiles.Map.WALL, left, top, width, 1);
            // left wall
            this._wallsLayer.weightedRandomize(Constants.UI.SpriteMaps.Tiles.Map.WALL, left, top, 1, height);
            // bottom wall
            this._wallsLayer.weightedRandomize(Constants.UI.SpriteMaps.Tiles.Map.WALL, left, bottom, width, 1);
            // right wall
            this._wallsLayer.weightedRandomize(Constants.UI.SpriteMaps.Tiles.Map.WALL, right, top, 1, height);

            this._radarLayer.fill(0, left+1, top+1, width-2, height-2);

            // Dungeons have rooms that are connected with doors. Each door has an x & y relative to the
            // room's location
            const doors = room.getDoorLocations();
            for (let i = 0; i < doors.length; i++) {
                let door = doors[i];

                if (door.y === 0) {
                    this._wallsLayer.removeTileAt(x + door.x - 1, y + door.y);
                    this._radarLayer.putTileAt(0, x + door.x - 1, y + door.y);
                } else if (door.y === room.height - 1) {
                    this._wallsLayer.removeTileAt(x + door.x - 1, y + door.y);
                    this._radarLayer.putTileAt(0, x + door.x - 1, y + door.y);
                } else if (door.x === 0) {
                    this._wallsLayer.removeTileAt(x + door.x, y + door.y - 1);
                    this._radarLayer.putTileAt(0, x + door.x, y + door.y - 1);
                } else if (door.x === room.width - 1) {
                    this._wallsLayer.removeTileAt(x + door.x, y + door.y - 1);
                    this._radarLayer.putTileAt(0, x + door.x, y + door.y - 1);
                }
            }
        });

        this._wallsLayer.setCollisionBetween(1, 14);
        // this.scene.physics.add.existing(this._primaryLayer);
        // this._primaryLayer.body.mass = 1000000;
    }
}