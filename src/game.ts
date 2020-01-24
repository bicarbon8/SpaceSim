import { GameScene } from "./game-scene";

const gameConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    scale: {
        width: window.innerWidth,
        height: window.innerHeight
    },
    backgroundColor: '#000000',
    parent: 'space-sim',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
        }
    },
    scene: GameScene
};
export const game: Phaser.Game = new Phaser.Game(gameConfig);

window.addEventListener('resize', () => {
    game.scale.refresh();
})