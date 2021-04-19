import Dungeon from "@mikewesthad/dungeon";

export class GameMap {
    private _scene: Phaser.Scene;

    constructor(scene: Phaser.Scene) {
        this._scene = scene;

        this._createGameObj();
    }

    private _createGameObj(): void {
        let dungeon = new Dungeon({
            randomSeed: 'bicarbon8',
            width: 1000,
            height: 1000,
            rooms: {
                width: {
                    min: 50,
                    max: 100,
                    onlyOdd: true
                },
                height: {
                    min: 50,
                    max: 100,
                    onlyOdd: true
                }
            }
        });

        let tileMap: Phaser.Tilemaps.Tilemap = this._scene.make.tilemap({
            tileWidth: 32,
            tileHeight: 32,
            width: dungeon.width,
            height: dungeon.height
        });

        let tiles = {
            BOX: 1,
            WALL: [
                { index: 1, weight: 1 },
                { index: 2, weight: 1 },
                { index: 3, weight: 1 },
                { index: 4, weight: 1 },
                { index: 5, weight: 1 },
                { index: 6, weight: 1 },
                { index: 7, weight: 1 },
                { index: 8, weight: 1 },
                { index: 9, weight: 1 },
                { index: 10, weight: 1 },
                { index: 11, weight: 1 },
                { index: 12, weight: 1 },
                { index: 13, weight: 1 },
                { index: 14, weight: 1 }
            ]
        };

        let tileset: Phaser.Tilemaps.Tileset = tileMap.addTilesetImage('tiles', 'metaltiles', 32, 32, 0, 0);
        let mapLayer = tileMap.createBlankLayer('Map Layer', tileset);

        dungeon.rooms.forEach((room) => {
            var x = room.x;
            var y = room.y;
            var w = room.width;
            var h = room.height;
            var cx = Math.floor(x + w / 2);
            var cy = Math.floor(y + h / 2);
            var left = x;
            var right = x + (w - 1);
            var top = y;
            var bottom = y + (h - 1);

            // Place the room corners tiles
            tileMap.putTileAt(tiles.BOX, left, top, true);
            tileMap.putTileAt(tiles.BOX, right, top, true);
            tileMap.putTileAt(tiles.BOX, right, bottom, true);
            tileMap.putTileAt(tiles.BOX, left, bottom, true);

            tileMap.weightedRandomize(tiles.WALL, left + 1, top, w - 2, 1);
            tileMap.weightedRandomize(tiles.WALL, left + 1, bottom, w - 2, 1);
            tileMap.weightedRandomize(tiles.WALL, left, top + 1, 1, h - 2);
            tileMap.weightedRandomize(tiles.WALL, right, top + 1, 1, h - 2);
        });

        mapLayer.setCollisionByExclusion([]);
    }
}