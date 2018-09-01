import { Canvas } from "../canvas";
import { LiteEvent } from "../events";
import { Point } from "../point";
import { StepLayer } from "./layers";

export class Transition extends StepLayer {
    private _onEnd : LiteEvent<Transition, void> = new LiteEvent<Transition, void>();

    private b : number;
    private image : ImageBitmap;
    private time : number = 0;
    private totalTime : number = 2000.0;

    constructor(imageData : ImageData) {
        super();

        // sin equation: y = a*sin(b*x + c) + d
        // a sin period is 2PI / b
        // we want a half period of totalTime so we're looking for b: b = 2PI / period
        this.b = (Math.PI * 2) / (this.totalTime * 2);

        createImageBitmap(imageData).then(image => this.image = image);
    }

    get OnEnd() : LiteEvent<Transition, void> {
        return this._onEnd.Expose();
    }

    Draw(canvas : Canvas) : void {
        if (this.image != null) {
            canvas.DrawBackgroundImage(this.image);
        }

        canvas.DrawRect(new Point(), canvas.Size, `rgba(0.0, 0.0, 0.0, ${Math.sin(this.b * this.time)})`);
    }

    Step(delta : number) : void {
        this.time += delta;

        if (this.image != null && this.time >= this.totalTime / 2) {
            this.image = null;
        }

        if (this.time >= this.totalTime) {
            this._onEnd.Trigger(this, null);
        }
    }
}
