import { Exploder, ExploderOptions, TryCatch } from "space-sim-shared";
import { environment } from "../../../../environments/environment";
import { SpaceSimClient } from "../space-sim-client";

export class UiExploder extends Exploder {
    private _destroyedSound: Phaser.Sound.BaseSound;
    private _flareParticleEmitter: Phaser.GameObjects.Particles.ParticleEmitterManager;
    private _explosionParticleEmitter: Phaser.GameObjects.Particles.ParticleEmitterManager;

    static preload(scene: Phaser.Scene): void {
        scene.load.image('explosion', `${environment.baseUrl}/assets/particles/explosion.png`);
        scene.load.spritesheet('flares', `${environment.baseUrl}/assets/particles/flares.png`, {
            frameWidth: 130,
            frameHeight: 132,
            startFrame: 0,
            endFrame: 4
        });
        scene.load.audio('explosion', `${environment.baseUrl}/assets/audio/effects/ship-explosion.ogg`);
    }
    
    constructor(scene: Phaser.Scene) {
        super(scene);
        TryCatch.run(() => this._destroyedSound = this.scene.sound.add('explosion', {volume: 0.1}),
            'warn', 'unable to load explosion sound', 'none');
        TryCatch.run(() => this._flareParticleEmitter = this.scene.add.particles('flares'),
            'warn', 'unable to load flares sprite as particles', 'none');
        TryCatch.run(() => this._explosionParticleEmitter = this.scene.add.particles('explosion'),
            'warn', 'unable to load explosion sprite as particles', 'none');
    }

    override explode(options: ExploderOptions): this {
        // create particle systems for destruction
        this._flareParticleEmitter.setPosition(options.location.x, options.location.y);
        this._flareParticleEmitter.setDepth(SpaceSimClient.Constants.UI.Layers.PLAYER);
        this._explosionParticleEmitter.setPosition(options.location.x, options.location.y);
        this._explosionParticleEmitter.setDepth(SpaceSimClient.Constants.UI.Layers.PLAYER);

        TryCatch.run(() => this._destroyedSound.play(), 'none');

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
            frame: SpaceSimClient.Constants.UI.SpriteMaps.Flares.red as number,
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

        return this;
    }
}