import * as Phaser from "phaser";
import Dungeon from "@mikewesthad/dungeon";
import { Helpers } from "../utilities/helpers";
import { Ship } from "../ships/ship";
import { BaseScene } from "../scenes/base-scene";
import { NumberOrRange } from "../interfaces/number-range";
import { SpaceSim } from "../space-sim";
import { IsConfigurable } from "../interfaces/is-configurable";

export type GameTile = {
    name: string;
    index?: number;
    x: number;
    y: number;
};

export type GameRoom = {
    width: number;
    height: number;
    left: number;
    top: number;
    collisionTiles: Array<GameTile>;
    nonCollisionTiles: Array<GameTile>;
    visible?: boolean;
};

export type GameLevelConfig = {
    rooms: Array<GameRoom>
};

export type GameLevelOptions = Partial<GameLevelConfig> & {
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

export class GameLevel extends Phaser.Tilemaps.Tilemap implements IsConfigurable<GameLevelConfig> {
    public scene: BaseScene;

    private readonly _rooms = new Array<GameRoom>();

    private _wallsLayer: Phaser.Tilemaps.TilemapLayer;
    private _radarLayer: Phaser.Tilemaps.TilemapLayer;

    constructor(scene: BaseScene, options?: GameLevelOptions) {
        options = {
            rooms: new Array<GameRoom>(),
            seed: 'bicarbon8',
            width: 200, // in tiles, not pixels
            height: 200,
            roomWidth: {min: 10, max: 25}, // in tiles, not pixels
            roomHeight: {min: 25, max: 25},
            doorPadding: 2,
            maxRooms: 100,
            tileWidth: 96, // pixels
            tileHeight: 96,
            ...options
        };
        super(scene, new Phaser.Tilemaps.MapData({
            tileWidth: options.tileWidth,
            tileHeight: options.tileHeight,
            width: options.width,
            height: options.height
        }));

        if (!options?.rooms?.length) {
            options.rooms = this._createRooms(options);
        }

        this.configure(options);
    }

    get config(): GameLevelConfig {
        return {
            rooms: this.rooms
        };
    }

    configure(config: Partial<GameLevelConfig>): this {
        if (config?.rooms?.length) {
            this._rooms.splice(0, this._rooms.length, ...config.rooms);
            this._createLayers(...config.rooms);
        }
        return this;
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

    get rooms(): GameRoom[] {
        return this._rooms;
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

    getRoomAt(tileX: number, tileY: number): GameRoom {
        return this._rooms.find(r => r.left <= tileX && tileX < r.left+r.width && r.top <= tileY && tileY < r.top+r.height);
    }

    getRoomAtWorldXY(x: number, y: number): GameRoom {
        const tile = this._wallsLayer?.worldToTileXY(x, y);
        return this.getRoomAt(tile.x, tile.y);
    }

    getRoomClosestToOrigin(): GameRoom {
        const zero = Helpers.vector2();
        let closest: GameRoom;
        this._rooms.forEach(room => {
            const centerX = room.left + Math.floor(room.width / 2);
            const centerY = room.top + Math.floor(room.height / 2);
            if (closest) {
                const closestCenterX = room.left + Math.floor(room.width / 2);
                const closestCenterY = room.top + Math.floor(room.height / 2);
                const pos = this.tileToWorldXY(closestCenterX, closestCenterY);
                const newPos = this.tileToWorldXY(centerX, centerY);
                if (Phaser.Math.Distance.BetweenPoints(zero, newPos) < Phaser.Math.Distance.BetweenPoints(zero, pos)) {
                    closest = room;
                }
            } else {
                closest = room;
            }
        });
        return closest;
    }

    getRoomFurthestFromOrigin(): GameRoom {
        const zero = Helpers.vector2();
        let furthest: GameRoom;
        this._rooms.forEach(room => {
            const centerX = room.left + Math.floor(room.width / 2);
            const centerY = room.top + Math.floor(room.height / 2);
            if (furthest) {
                const closestCenterX = room.left + Math.floor(room.width / 2);
                const closestCenterY = room.top + Math.floor(room.height / 2);
                const pos = this.tileToWorldXY(closestCenterX, closestCenterY);
                const newPos = this.tileToWorldXY(centerX, centerY);
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

    private _createRooms(options: GameLevelOptions): Array<GameRoom> {
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

        const rooms = dungeon.rooms.map(r => {
            const wallTiles = new Array<GameTile>();
            const floorTiles = new Array<GameTile>();
            const doors = r.getDoorLocations(); // door locations are relative to room, not dungeon
            for (let i=0; i<r.width; i++) {
                for (let j=0; j<r.height; j++) {
                    const p = {x: i+r.x, y: j+r.y};
                    if (doors.find(d => Helpers.vector2(d).equals({x: i, y: j}))) {
                        // ensure floor tile at door locations
                        floorTiles.push({
                            x: p.x,
                            y: p.y,
                            index: 0,
                            name: 'minimaptile'
                        });
                        continue; // move to next location
                    }

                    const index = Phaser.Math.RND.pick(SpaceSim.Constants.GameLevels.Tiles.WALL);
                    // if along the left, right, top or bottom side
                    if ((j === 0 || j === r.height-1) || (i === 0 || i === r.width-1)) {
                        wallTiles.push({
                            x: p.x,
                            y: p.y,
                            index: index,
                            name: 'metaltiles'
                        });
                    } else {
                        floorTiles.push({
                            x: p.x,
                            y: p.y,
                            index: 0,
                            name: 'minimaptile'
                        });
                    }
                }
            }
            return {
                top: r.top,
                left: r.left,
                width: r.width,
                height: r.height,
                collisionTiles: wallTiles,
                nonCollisionTiles: floorTiles
            };
        });

        return rooms;
    }

    private _createLayers(...rooms: Array<GameRoom>): void {
        if (this._wallsLayer) {
            this._wallsLayer.destroy();
        }
        if (this._radarLayer) {
            this._radarLayer.destroy();
        }
        const wallsTileSet = this.addTilesetImage('tiles', 'metaltiles', 96, 96, 0, 0);
        this._wallsLayer = this.createBlankLayer('walls', wallsTileSet);
        const radarTileSet = this.addTilesetImage('minimaptile', 'minimaptile', 96, 96, 0, 0);
        this._radarLayer = this.createBlankLayer('radar', radarTileSet);
        
        rooms.forEach(room => {
            room.collisionTiles.forEach(t => this._wallsLayer.putTileAt(t.index, t.x, t.y));
            room.nonCollisionTiles.forEach(t => this._radarLayer.putTileAt(t.index, t.x, t.y));
        });

        this._wallsLayer.setCollisionBetween(1, 14);
    }
}