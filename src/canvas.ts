export class Canvas {
    private element : HTMLCanvasElement;
    private ctx : CanvasRenderingContext2D;

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

        this.ctx = this.element.getContext("2d");
        if (!this.ctx) {
        }

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
}