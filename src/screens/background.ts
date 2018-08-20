import { Screen } from "./screen";
import { Canvas } from "../canvas";

export class Background extends Screen {
    private backgroundImage : ImageBitmap;
    private backgroundImageURL : string;

    constructor(imageURL : string) {
        super();

        this.BackgroundImage = imageURL;
    }

    set BackgroundImage(imageURL : string) {
        if (imageURL != this.backgroundImageURL) {
            this.backgroundImageURL = imageURL;
            fetch(imageURL).then(response => response.blob()).then(blobData => {
                createImageBitmap(blobData).then(image => this.backgroundImage = image);
            });
        }
    }

    Draw(canvas : Canvas) : void {
        if (this.backgroundImage != null) {
            canvas.DrawBackgroundImage(this.backgroundImage);
        }
    }
}