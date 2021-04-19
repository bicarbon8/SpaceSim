import Dungeon from "@mikewesthad/dungeon";

export class GameMap {
    private _map: Dungeon;
    private _scene: Phaser.Scene;

    constructor(scene: Phaser.Scene) {
        this._scene = scene;

        this._createGameObj();
    }

    private _createGameObj(): void {
        let dungeon = new Dungeon({
            randomSeed: 'bicarbon8',
            width: 10000,
            height: 10000,
            rooms: {
                width: {
                    min: 500,
                    max: 1000,
                    onlyOdd: true
                },
                height: {
                    min: 500,
                    max: 1000,
                    onlyOdd: true
                }
            }
        });

        let tileMap: Phaser.Tilemaps.Tilemap = this._scene.make.tilemap({
            tileWidth: 32,
            tileHeight: 32,
            width: this._map.width,
            height: this._map.height
        });

        let tileset: Phaser.Tilemaps.Tileset = tileMap.addTilesetImage('tiles', 'tiles', 32, 32, 0, 0);

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

            tileMap.putTileAt(0, left, top, true, 'midground');
            tileMap.putTileAt(0, left, bottom, true, 'midground');
            tileMap.putTileAt(0, left, top, true, 'midground');
            tileMap.putTileAt(0, right, top, true, 'midground');
        });
    }
}