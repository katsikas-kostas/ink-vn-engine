import { Canvas } from "../canvas";
import { Loader } from "../loader";
import { Point } from "../point";
import { Layer } from "./layers";

class Character extends Layer {
    private centerPosX : number;
    private position : Point;
    private sprite : ImageBitmap;
    private spriteURL : string;

    constructor(spriteURL : string, posX : number) {
        super();

        this.centerPosX = posX;
        this.Sprite = spriteURL;
    }

    set Sprite(spriteURL : string) {
        if (spriteURL !== this.spriteURL) {
            this.spriteURL = spriteURL;
            Loader.LoadImage(spriteURL).then(image => this.sprite = image);
        }
    }

    Draw(canvas : Canvas) : void {
        if (this.sprite != null) {
            if (this.position == null) {
                this.position = new Point(
                    this.centerPosX - (this.sprite.width / 2),
                    canvas.Size.Y - this.sprite.height
                );
            }

            canvas.DrawImage(this.sprite, this.position);
        }
    }
}

export class Characters extends Layer {
    private characters : Character[] = [];

    constructor() {
        super();
    }

    Add(spriteURL : string, canvas : Canvas) {
        // For now just handle one character at a time
        if (this.characters.length > 0) {
            this.characters = [];
        }

        this.characters.push(new Character(spriteURL, canvas.Size.X / 2));
    }

    Draw(canvas : Canvas) : void {
        for (const character of this.characters) {
            character.Draw(canvas);
        }
    }

    Remove() {
        this.characters = [];
    }
}
