import { Layer } from "./layers";
import { Canvas } from "../canvas";
import { Loader } from "../loader";

export class Background extends Layer {
    private backgroundImage : ImageBitmap;
    private backgroundImageURL : string;

    constructor();
    constructor(imageURL? : string) {
        super();

        if (imageURL != null) {
            this.BackgroundImage = imageURL;
        }
    }

    set BackgroundImage(imageURL : string) {
        if (imageURL != this.backgroundImageURL) {
            this.backgroundImageURL = imageURL;
            Loader.LoadImage(imageURL).then(image => {
                this.backgroundImage = image
            });
        }
    }

    Draw(canvas : Canvas) : void {
        if (this.backgroundImage != null) {
            canvas.DrawBackgroundImage(this.backgroundImage);
        }
    }
}