import { Choice } from "inkjs";
import { GameplayLayer } from "./layers";
import { Canvas } from "../canvas";
import { Point, Rect } from "../point";

class ChoiceBox {
    private id : number;
    private text : string;

    private position : Point;

    private fontSize : number = 24;
    private innerMargin : Point = new Point(20);
    private size : Point;

    private hasAlreadyBeenDrawnOnce : boolean = false;

    constructor(id : number, text : string, centerPosition : Point) {
        this.id = id;
        this.text = text;

        this.position = centerPosition;
    }

    get Id() : number {
        return this.id;
    }

    get BoundingRect() : Rect {
        return {
            Position : this.position,
            Size : this.size
        };
    }

    private beforeFirstDraw(canvas: Canvas) : void {
        canvas.DrawText0("", "transparent", this.fontSize);
        this.size = new Point(
            canvas.MeasureTextWidth(this.text) + (2 * this.innerMargin.X),
            (this.fontSize * 1.42857) + (2 * this.innerMargin.Y)
        );
        this.position = this.position.Sub(this.size.Div(new Point(2)));
        this.hasAlreadyBeenDrawnOnce = true;
    }

    Draw(canvas : Canvas) : void {
        if (!this.hasAlreadyBeenDrawnOnce) {
            this.beforeFirstDraw(canvas);
        }

        canvas.Translate(this.position);
        canvas.DrawRect0(this.size, "black");
        canvas.DrawText(this.text, this.innerMargin, "white", this.fontSize, this.size.X);
        canvas.Restore();
    }
}

export class ChoiceLayer extends GameplayLayer {
    choices : Choice[] = []

    choiceBoxes : ChoiceBox[] = []

    constructor() {
        super();
    }

    set Choices(choices : Choice[]) {
        this.choices = choices;

        this.choiceBoxes = [];
        let y : number = 100;
        for (const _choice of this.choices) {
            this.choiceBoxes.push(new ChoiceBox(_choice.index, _choice.text, new Point(640, y)));
            y += 100;
        }
    }

    Step(delta : number) : void {
    }

    Draw(canvas : Canvas) : void {
        for (const choiceBox of this.choiceBoxes) {
            choiceBox.Draw(canvas);
        }
    }

    Click(clickPosition : Point, action : Function) : void {
        for (const choiceBox of this.choiceBoxes) {
            if (clickPosition.IsInRect(choiceBox.BoundingRect)) {
                action(choiceBox.Id);
                break;
            }
        }
    }
}