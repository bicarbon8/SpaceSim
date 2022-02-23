import { Padding } from "./padding";
import { TextButtonOptions } from "./text-button-options";

export class TextButton extends Phaser.GameObjects.Container {
    private readonly _text: Phaser.GameObjects.Text;
    private readonly _button: Phaser.GameObjects.Graphics;
    private readonly _width: number;
    private readonly _height: number;
    private readonly _options: TextButtonOptions;

    constructor(options: TextButtonOptions) {
        super(options.scene, options.x, options.y);

        this._options = this._setDefaults(options);

        const padding: Padding = options.padding as Padding;

        this._text = this._createText();
        let width = this._text.width + padding.left + padding.right;
        this._width = (width < options.minWidth) ? options.minWidth : width;
        let height = this._text.height + padding.top + padding.bottom;
        this._height = (height < options.minHeight) ? options.minHeight : height;
        this._button = this._createButton();
        
        const outer = new Phaser.Math.Vector2(this._button.x - (this._width / 2), this._button.y - (this._height / 2));
        const inner = new Phaser.Math.Vector2(this._text.x, this._text.y);
        const delta = new Phaser.Math.Vector2(outer.x - inner.x, outer.y - inner.y);
        const offset = new Phaser.Math.Vector2(-padding.left - delta.x, -padding.top - delta.y);
        this._text.setPosition(inner.x - offset.x, inner.y - offset.y);
        
        const containerBounds: Phaser.Geom.Rectangle = new Phaser.Geom.Rectangle(this._options.x - (this._width / 2), this._options.y - (this._height / 2), this._width, this._height);
        this.setSize(containerBounds.width, containerBounds.height);

        this.scene.add.existing(this);
    }

    /**
     * updates the button text to the specified value
     * NOTE: this does NOT resize the button
     * @param text the text to display
     */
    setText(text: string): void {
        this._text.setText(text);
    }

    /**
     * updates the button textStyle to the specified value
     * NOTE: this does NOT resize the button
     * @param textStyle the textStyle to use
     */
    setTextStyle(textStyle: Phaser.Types.GameObjects.Text.TextStyle): void {
        this._text.setStyle(textStyle);
    }

    setButtonColor(color: number, alpha: number = 1): void {
        this._button.clear();
        this._button.fillStyle(color, alpha);
        this._button.fillRoundedRect(-(this._width / 2), -(this._height / 2), this._width, this._height, this._options.cornerRadius);
    }

    private _createText(): Phaser.GameObjects.Text {
        const txt = this.scene.add.text(0, 0, this._options.text, this._options.textStyle);
        txt.setPosition(-(txt.width / 2), -(txt.height / 2));
        this.add(txt);
        return txt;
    }

    private _createButton(): Phaser.GameObjects.Graphics {
        const rect = this.scene.add.graphics({fillStyle: {color: this._options.colour, alpha: this._options.alpha}});
        rect.fillRoundedRect(-(this._width / 2), -(this._height / 2), this._width, this._height, this._options.cornerRadius);
        this.add(rect);
        this.sendToBack(rect);
        return rect;
    }

    private _setDefaults(options: TextButtonOptions): TextButtonOptions {
        if (!options.text) { options.text = ''; }
        if (!options.padding) { options.padding = {}; }
        if (typeof options.padding !== 'object') { options.padding = {left: options.padding}; }
        if (!options.padding.left) { options.padding.left = 0; }
        if (!options.padding.top) { options.padding.top = options.padding.left; }
        if (!options.padding.right) { options.padding.right = options.padding.left; }
        if (!options.padding.bottom) { options.padding.bottom = options.padding.top; }
        if (!options.cornerRadius) { options.cornerRadius = 0; }
        if (!options.colour) { options.colour = 0.000000; }
        if (!options.alpha) { options.alpha = 1; }
        if (!options.minWidth) { options.minWidth = 0; }
        if (!options.minHeight) { options.minHeight = 0; }

        return options;
    }
}