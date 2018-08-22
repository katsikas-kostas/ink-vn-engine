import { Canvas } from "../canvas";
import { Point } from "../point";

export abstract class Layer {
    abstract Draw(canvas : Canvas) : void;
}

export abstract class StepLayer extends Layer {
    abstract Step(delta : number) : void;
}

export abstract class GameplayLayer extends StepLayer {
    abstract Click(clickPosition : Point, action : Function) : void;
}

export * from "./background";
export * from "./characters";
export * from "./choicelayer";
export * from "./textlayer";
export * from "./transition";