import Phaser from 'phaser';

const fragShader = `
#define SHADER_NAME MINI_MAP_SHADER
precision mediump float;
uniform sampler2D uMainSampler;
varying vec2 outTexCoord;
void main(void) 
{
    // if (length(outTexCoord.xy - vec2(0.5, 0.5)) > 0.5)
    // {
    //     discard;
    // } 
    // else 
    // {
        vec4 color = texture2D(uMainSampler, outTexCoord);
        gl_FragColor = vec4(color.r, 0.0, 0.0, color.a);
    // }
}
`;

export default class MiniMapShader extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
    constructor (game: Phaser.Game) {
        super({
            game: game,
            name: 'MiniMapShader',
            fragShader: fragShader,
            renderTarget: true,
            uniforms: ['uMainSampler']
        } as Phaser.Types.Renderer.WebGL.WebGLPipelineConfig);
    }
}