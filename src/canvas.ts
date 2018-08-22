import { EventDispatcher, IEvent } from "strongly-typed-events";

import { Point } from "./point";

export class Canvas {
    private element : HTMLCanvasElement;
    private ctx : CanvasRenderingContext2D;

    private _onClick : EventDispatcher<Canvas, Point> = new EventDispatcher<Canvas, Point>();

    constructor(container_id : string, width : number, height : number) {
        const container = document.getElementById(container_id);

        if (container.tagName == "canvas") {
            this.element = <HTMLCanvasElement> container;
        } else {
            this.element = document.createElement("canvas");
            container.appendChild(this.element);
        }

        this.element.width = width;
        this.element.height = height;

        this.ctx = this.element.getContext("2d");
        if (!this.ctx) {
        }

        this.element.addEventListener("click", this._click.bind(this));

        this.Clear();
    }

    get Size() : Point {
        return new Point(this.element.width, this.element.height);
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