import { EventDispatcher, IEvent } from "strongly-typed-events";
import { Point } from "./point";

export class Canvas {
    private element : HTMLCanvasElement;
    private ctx : CanvasRenderingContext2D;

    private _onClick : EventDispatcher<Canvas, Point> = new EventDispatcher<Canvas, Point>();

    private textColor : string = "black";

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
        this.element.style.border = "1px solid black";

        this.ctx = this.element.getContext("2d");
        if (!this.ctx) {
        }

        this.element.addEventListener("click", this._click.bind(this));

        this.Clear();
    }

    Clear() : void {
        this.ctx.clearRect(0, 0, this.element.width, this.element.height);
    }

    DrawText(text : string) : void {
        this.ctx.fillStyle = this.textColor;
        this.ctx.font = "24px sans-serif";
        this.ctx.fillText(text, 0, 200, this.element.width);
    }

    get onClick() : IEvent<Canvas, Point> {
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