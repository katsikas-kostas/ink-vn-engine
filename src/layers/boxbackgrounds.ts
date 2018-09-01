import { Canvas, HiddenCanvas } from "../canvas";
import { Loader } from "../loader";
import { IRect, Point } from "../point";
import { Layer } from "./layers";

export enum BoxBackgroundTypes {
    COLOR, NINEPATCH, STRETCH
}

class ClassBoxBackgroundFactory {
    Create(type : BoxBackgroundTypes, background : string, size : Point, position? : Point) : BoxBackground {
        switch (type) {
            case BoxBackgroundTypes.COLOR: {
                return new ColoredBoxBackground(background, size, position);
            }
            case BoxBackgroundTypes.NINEPATCH: {
                return new NinePatchBoxBackground(background, size, position);
            }
            case BoxBackgroundTypes.STRETCH: {
                return new StretchBoxBackground(background, size, position);
            }
        }
    }
}

export const BoxBackgroundFactory : ClassBoxBackgroundFactory = new ClassBoxBackgroundFactory();

export abstract class BoxBackground extends Layer {
    protected box : IRect;

    constructor(size : Point, position? : Point) {
        super();

        this.box = {
            Position : position == null ? new Point() : position,
            Size : size
        };
    }

    set Position(position : Point) {
        this.box.Position = position;
    }

    set Size(size : Point) {
        this.box.Size = size;
    }
}

class ColoredBoxBackground extends BoxBackground {
    Color : string;

    constructor(color : string, size : Point, position? : Point) {
        super(size, position);

        this.Color = color;
    }

    Draw(canvas : Canvas) : void {
        canvas.DrawRect(this.box.Position, this.box.Size, this.Color);
    }
}

class NinePatchBoxBackground extends BoxBackground {
    private ninePatch : ImageBitmap;
    private ninePatchURL : string;

    constructor(ninePatchURL : string, size : Point, position? : Point) {
        super(size, position);

        this.NinePatch = ninePatchURL;
    }

    set NinePatch(ninePatchURL : string) {
        if (ninePatchURL !== this.ninePatchURL) {
            this.ninePatchURL = ninePatchURL;

            Loader.LoadImage(ninePatchURL)
            .then(image => {
                const hiddenCanvas = new HiddenCanvas(this.box.Size.Clone());
                const patchSize = new Point(image.width / 3, image.height / 3);

                function drawPatchTo(patchPosition : Point, destPos : Point, destSize? : Point) {
                    hiddenCanvas.DrawImageTo(
                        image, { Position : patchPosition, Size : patchSize },
                        { Position : destPos, Size : destSize != null ? destSize : patchSize }
                    );
                }

                const patchDestinations = [
                    new Point(), new Point(this.box.Size.X - patchSize.X, 0),
                    new Point(0, this.box.Size.Y - patchSize.Y),
                    new Point(this.box.Size.X - patchSize.X, this.box.Size.Y - patchSize.Y)
                ];
                drawPatchTo(new Point(), patchDestinations[0]); // Upper Left
                drawPatchTo(patchSize.Mult(new Point(2, 0)), patchDestinations[1]); // Upper Right
                drawPatchTo(patchSize.Mult(new Point(0, 2)), patchDestinations[2]); // Lower Left
                drawPatchTo(patchSize.Mult(new Point(2, 2)), patchDestinations[3]); // Lower Right

                drawPatchTo(patchSize.Mult(new Point(1, 0)), patchSize.Mult(new Point(1, 0)),
                    new Point(this.box.Size.X - (patchSize.X * 2), patchSize.Y)); // Top
                drawPatchTo(patchSize.Mult(new Point(2, 1)), patchDestinations[1].Add(new Point(0, patchSize.Y)),
                    new Point(patchSize.X, this.box.Size.Y - (patchSize.Y * 2))); // Right
                drawPatchTo(patchSize.Mult(new Point(1, 2)), patchDestinations[2].Add(new Point(patchSize.X, 0)),
                    new Point(this.box.Size.X - (patchSize.X * 2), patchSize.Y)); // Bottom
                drawPatchTo(patchSize.Mult(new Point(0, 1)), patchSize.Mult(new Point(0, 1)),
                    new Point(patchSize.X, this.box.Size.Y - (patchSize.Y * 2))); // Left

                drawPatchTo(patchSize.Mult(new Point(1, 1)),
                    patchSize.Mult(new Point(1, 1)), this.box.Size.Sub(patchSize.Mult(new Point(2, 2)))); // Center

                createImageBitmap(hiddenCanvas.GetImageData()).then(ninePatchImage => {
                    this.ninePatch = ninePatchImage;
                    // hiddenCanvas.Destroy();
                });
            });
        }
    }

    Draw(canvas : Canvas) : void {
        if (this.ninePatch != null) {
            canvas.DrawImage(this.ninePatch, this.box.Position);
        }
    }
}

class StretchBoxBackground extends BoxBackground {
    private image : ImageBitmap;
    private imageSize : Point;
    private imageURL : string;

    constructor(imageURL : string, size : Point, position : Point) {
        super(size, position);

        this.Image = imageURL;
    }

    set Image(imageURL : string) {
        if (imageURL !== this.imageURL) {
            this.imageURL = imageURL;

            Loader.LoadImage(imageURL)
            .then(image => {
                this.image = image;
                this.imageSize = new Point(this.image.width, this.image.height);
            });
        }
    }

    Draw(canvas : Canvas) : void {
        if (this.image != null) {
            canvas.DrawImageTo(
                this.image,
                { Position : new Point(), Size : this.imageSize },
                { Position : this.box.Position, Size : this.box.Size }
            );
        }
    }
}
