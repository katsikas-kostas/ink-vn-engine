import { Canvas } from "../canvas";
import { Point } from "../point";

export abstract class Screen {
    constructor() { }

    abstract Draw(canvas : Canvas) : void;
    abstract Click(clickPosition : Point, action : Function) : void;
}
