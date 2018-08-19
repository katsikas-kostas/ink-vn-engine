import { Canvas } from "../canvas";

export abstract class Screen {
    abstract Draw(canvas : Canvas) : void
}
