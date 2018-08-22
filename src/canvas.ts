import { EventDispatcher, IEvent } from "strongly-typed-events";

import { Point, Rect } from "./point";

export class Canvas {
    private element : HTMLCanvasElement;
    private ctx : CanvasRenderingContext2D;

    private _onClick : EventDispatcher<Canvas, Point> = new EventDispatcher<Canvas, Point>();

    constructor(container_id : string, size : Point) {
        const container = document.getElementById(container_id);

        if (container.tagName == "canvas") {
            this.element = <HTMLCanvasElement> container;
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

    GetImageData() : ImageData {
        return this.ctx.getImageData(0, 0, this.Size.X, this.Size.Y);
    }

    Translate(position : Point) : void {
        this.Restore();
        this.ctx.save();
        this.ctx.translate(position.X, position.Y);
    }

    Restore() : void {
        this.ctx.restore();
    }

    DrawRect0(size : Point, color : string) : void {
        this.DrawRect(new Point(), size, color);
    }

    DrawRect(position : Point, size : Point, color : string) : void {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(position.X, position.Y, size.X, size.Y);
    }

    DrawBackgroundImage(image : ImageBitmap) : void {
        this.ctx.drawImage(image, 0, 0, this.element.width, this.element.height);
    }

    DrawImage(image : ImageBitmap, position : Point) : void {
        this.ctx.drawImage(image, position.X, position.Y, image.width, image.height);
    }

    DrawImageTo(image : ImageBitmap, source : Rect, destination : Rect) {
        this.ctx.drawImage(
            image,
            source.Position.X, source.Position.Y,
            source.Size.X, source.Size.Y,
            destination.Position.X, destination.Position.Y,
            destination.Size.X, destination.Size.Y
        );
    }

    DrawText0(text : string, color : string, fontSize : number, maxWidth? : number) : void {
        this.DrawText(text, new Point(), color, fontSize, maxWidth);
    }

    DrawText(text : string, position : Point, color : string, fontSize : number, maxWidth? : number) : void {
        this.ctx.fillStyle = color;
        this.ctx.font = `${fontSize}px sans-serif`;
        this.ctx.textBaseline = "top";
        this.ctx.fillText(text, position.X, position.Y, maxWidth);
    }

    MeasureTextWidth(text : string) : number {
        // We measure with the last font used in the context
        return this.ctx.measureText(text).width;
    }

    get OnClick() : IEvent<Canvas, Point> {
        return this._onClick.asEvent();
    }

    private _click(ev : MouseEvent) : void {
        let clickPosition : Point = new Point(
            ev.pageX - this.element.offsetLeft,
            ev.pageY - this.element.offsetTop
        );
        this._onClick.dispatchAsync(this, clickPosition);
    }
}

export class HiddenCanvas extends Canvas {
    private hiddenElement : HTMLElement

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