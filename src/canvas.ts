import { LiteEvent } from "./events";
import { IRect, Point } from "./point";

export class Canvas {
    private _onClick : LiteEvent<Canvas, Point> = new LiteEvent<Canvas, Point>();
    private _onMove : LiteEvent<Canvas, Point> = new LiteEvent<Canvas, Point>();
    private ctx : CanvasRenderingContext2D;
    private element : HTMLCanvasElement;

    constructor(containerID : string, size : Point) {
        const container = document.getElementById(containerID);

        if (container.tagName === "canvas") {
            this.element = container as HTMLCanvasElement;
        } else {
            this.element = document.createElement("canvas");
            container.appendChild(this.element);
        }

        this.element.width = size.X;
        this.element.height = size.Y;

        this.ctx = this.element.getContext("2d");
        if (!this.ctx) {
        }

        this.element.addEventListener("click", this._click.bind(this));
        this.element.addEventListener("mousemove", this._move.bind(this));

        this.Clear();
    }

    get Size() : Point {
        return new Point(this.element.width, this.element.height);
    }

    set Size(size : Point) {
        this.element.width = size.X;
        this.element.height = size.Y;
    }

    Clear() : void {
        this.ctx.clearRect(0, 0, this.element.width, this.element.height);
    }

    DrawBackgroundImage(image : ImageBitmap) : void {
        this.ctx.drawImage(image, 0, 0, this.element.width, this.element.height);
    }

    DrawImage(image : ImageBitmap, position : Point) : void {
        this.ctx.drawImage(image, position.X, position.Y, image.width, image.height);
    }

    DrawImageTo(image : ImageBitmap, source : IRect, destination : IRect) {
        this.ctx.drawImage(
            image,
            source.Position.X, source.Position.Y,
            source.Size.X, source.Size.Y,
            destination.Position.X, destination.Position.Y,
            destination.Size.X, destination.Size.Y
        );
    }

    DrawRect(position : Point, size : Point, color : string) : void {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(position.X, position.Y, size.X, size.Y);
    }

    DrawRect0(size : Point, color : string) : void {
        this.DrawRect(new Point(), size, color);
    }

    DrawText(text : string, position : Point, color : string, fontSize : number, maxWidth? : number) : void {
        this.ctx.fillStyle = color;
        this.ctx.font = `${fontSize}px sans-serif`;
        this.ctx.textBaseline = "top";
        this.ctx.fillText(text, position.X, position.Y, maxWidth);
    }

    DrawText0(text : string, color : string, fontSize : number, maxWidth? : number) : void {
        this.DrawText(text, new Point(), color, fontSize, maxWidth);
    }

    GetImageData() : ImageData {
        return this.ctx.getImageData(0, 0, this.Size.X, this.Size.Y);
    }

    MeasureTextWidth(text : string) : number {
        // We measure with the last font used in the context
        return this.ctx.measureText(text).width;
    }

    Restore() : void {
        this.ctx.restore();
    }

    SetCursor(cursor : string) : void {
        this.element.style.cursor = cursor;
    }

    Translate(position : Point) : void {
        this.Restore();
        this.ctx.save();
        this.ctx.translate(position.X, position.Y);
    }

    get OnClick() : LiteEvent<Canvas, Point> {
        return this._onClick.Expose();
    }

    get OnMove() : LiteEvent<Canvas, Point> {
        return this._onMove.Expose();
    }

    private _click(ev : MouseEvent) : void {
        ev.preventDefault();
        this._onClick.Trigger(this, new Point(
            ev.pageX - this.element.offsetLeft,
            ev.pageY - this.element.offsetTop
        ));
    }

    private _move(ev : MouseEvent) : void {
        this._onMove.Trigger(this, new Point(
            ev.pageX - this.element.offsetLeft,
            ev.pageY - this.element.offsetTop
        ));
    }
}

export class HiddenCanvas extends Canvas {
    private hiddenElement : HTMLElement;

    constructor(size : Point) {
        const id = `c_${Math.random().toString().slice(2, 7)}`;
        const hiddenElement = document.createElement("div");
        hiddenElement.id = id;
        document.body.appendChild(hiddenElement);

        super(id, size);

        this.hiddenElement = hiddenElement;
    }

    Destroy() : void {
        this.hiddenElement.remove();
    }
}
