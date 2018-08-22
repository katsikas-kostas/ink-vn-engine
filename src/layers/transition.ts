import { EventDispatcher, IEvent } from "strongly-typed-events";

import { StepLayer } from "./layers";
import { Canvas } from "../canvas";
import { Point } from "../point";

export class Transition extends StepLayer {
    private time : number = 0;
    private totalTime : number = 2000.0;

    private image : ImageBitmap;

    // sin equation: y = a*sin(b*x + c) + d
    // a sin period is 2PI / b
    // we want a half period of totalTime so we're looking for b: b = 2PI / period
    private b : number = (Math.PI * 2) / (this.totalTime * 2);

    private _onEnd : EventDispatcher<Transition, void> = new EventDispatcher<Transition, void>();

    constructor(imageData : ImageData) {
        super();

        const prom = createImageBitmap(imageData);
        prom.then(image => this.image = image);
    }

    get OnEnd() : IEvent<Transition, void> {
        return this._onEnd.asEvent();
    }

    Step(delta : number) : void {
        this.time += delta;

        if (this.image != null && this.time >= this.totalTime / 2) {
            this.image = null;
        }

        if (this.time >= this.totalTime) {
            this._onEnd.dispatchAsync(this, null);
        }
    }

    Draw(canvas : Canvas) : void {
        if (this.image != null) {
            canvas.DrawBackgroundImage(this.image);
        }

        canvas.DrawRect(new Point(), canvas.Size, `rgba(0.0, 0.0, 0.0, ${Math.sin(this.b * this.time)})`);
    }
}