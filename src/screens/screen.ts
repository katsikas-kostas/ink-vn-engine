import { Canvas } from "../canvas";

export abstract class Screen {
    constructor() {
    }

    abstract Draw(canvas : Canvas) : void
}
