import { Constants } from "./constants";
import { Helpers } from "./helpers";

export type ExplosionOptions = {
    scale?: number;
    location: Phaser.Types.Math.Vector2Like;
}

export class Explosion {
    public readonly scene: Phaser.Scene;

    private _destroyedSound: Phaser.Sound.BaseSound;
    private _flareParticleEmitter: Phaser.GameObjects.Particles.ParticleEmitterManager;
    private _explosionParticleEmitter: Phaser.GameObjects.Particles.ParticleEmitterManager;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;

        Helpers.trycatch(() => this._destroyedSound = this.scene.sound.add('explosion', {volume: 0.1}),
            'unable to load explosion sound');
        Helpers.trycatch(() => this._flareParticleEmitter = this.scene.add.particles('flares'),
            'unable to load flares sprite as particles');
        Helpers.trycatch(() => this._explosionParticleEmitter = this.scene.add.particles('explosion'),
            'unable to load explosion sprite as particles');
    }

    explode(options: ExplosionOptions): void {
        // create particle systems for destruction
        this._flareParticleEmitter.setPosition(options.location.x, options.location.y);
        this._flareParticleEmitter.setDepth(Constants.UI.Layers.PLAYER);
        this._explosionParticleEmitter.setPosition(options.location.x, options.location.y);
        this._explosionParticleEmitter.setDepth(Constants.UI.Layers.PLAYER);

        this._destroyedSound.play();

        this._explosionParticleEmitter.createEmitter({
            lifespan: { min: 500, max: 1000 },
            speedX: { min: -1, max: 1 },
            speedY: { min: -1, max: 1 },
            angle: { min: -180, max: 179 },
            gravityX: 0,
            gravityY: 0,
            scale: { start: options.scale ?? 1, end: 0 },
            blendMode: 'ADD',
            maxParticles: 3
        });
        this._flareParticleEmitter.createEmitter({
            frame: Constants.UI.SpriteMaps.Flares.red as number,
            lifespan: { min: 100, max: 500 },
            speedX: { min: -600, max: 600 },
            speedY: { min: -600, max: 600 },
            angle: { min: -180, max: 179 },
            gravityX: 0,
            gravityY: 0,
            scale: { start: options.scale ?? 1, end: 0 },
            blendMode: 'ADD',
            maxParticles: 10
        });
    }
}