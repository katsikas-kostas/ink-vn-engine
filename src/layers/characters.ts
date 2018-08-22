import { Layer } from "./layers";
import { Canvas } from "../canvas";
import { Point } from "../point";

class Character extends Layer {
    private sprite : ImageBitmap;
    private spriteURL : string;

    private centerPosX : number;
    private position : Point;

    constructor(spriteURL : string, posX : number) {
        super();

        this.centerPosX = posX;
        this.Sprite = spriteURL;
    }

    set Sprite(spriteURL : string) {
        if (spriteURL != this.spriteURL) {
            this.spriteURL = spriteURL;
            fetch(spriteURL).then(response => response.blob()).then(blobData => {
                createImageBitmap(blobData).then(image => this.sprite = image);
            });
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

        this.characters.push(new Character(spriteURL, canvas.Size.X / 2))
    }

    Remove() {
        this.characters = [];
    }

    Draw(canvas : Canvas) : void {
        for (const character of this.characters) {
            character.Draw(canvas);
        }
    }
}