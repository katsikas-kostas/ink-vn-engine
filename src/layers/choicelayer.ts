import { Choice } from "inkjs";
import { GameplayLayer } from "./layers";
import { Canvas } from "../canvas";
import { Point, Rect } from "../point";

class ChoiceBox {
    private id : number
    private text : string

    private position : Point

    private fontSize : number = 24
    private innerMargin : Point = new Point(0, 20)
    private size : Point

    private hasAlreadyBeenDrawnOnce : boolean = false

    constructor(id : number, text : string, width : number, position : Point) {
        this.id = id;
        this.text = text;

        this.size = new Point(width, (this.fontSize * 1.42857) + (2 * this.innerMargin.Y));
        this.position = position;
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

    private beforeFirstDraw(canvas : Canvas) : void {
        canvas.DrawText0("", "transparent", this.fontSize);
        this.innerMargin.X = (this.size.X - canvas.MeasureTextWidth(this.text)) / 2;
    }

    Draw(canvas : Canvas) : void {
        if (!this.hasAlreadyBeenDrawnOnce) {
            this.beforeFirstDraw(canvas);
        }

        canvas.DrawRect(this.position, this.size, "black");
        canvas.DrawText(this.text, this.position.Add(this.innerMargin), "white", this.fontSize, this.size.X);
    }
}

export class ChoiceLayer extends GameplayLayer {
    screenSize : Point
    translation : Point
    boundingRect : Point

    choices : Choice[] = []

    choiceBoxes : ChoiceBox[] = []

    constructor(screenSize : Point) {
        super();

        this.screenSize = screenSize;
    }

    set Choices(choices : Choice[]) {
        this.choices = choices;

        this.choiceBoxes = [];
        const width = 200;
        const position = new Point(0, 0);
        for (const _choice of this.choices) {
            const newChoice = new ChoiceBox(_choice.index, _choice.text, width, position.Clone());
            this.choiceBoxes.push(newChoice);
            position.Y += newChoice.BoundingRect.Size.Y + 40;
        }
        this.boundingRect = new Point(width, position.Y - 40);
        this.translation = this.screenSize.Div(new Point(2)).Sub(this.boundingRect.Div(new Point(2)));
    }

    Step(delta : number) : void {
    }

    Draw(canvas : Canvas) : void {
        canvas.Translate(this.translation);
        for (const choiceBox of this.choiceBoxes) {
            choiceBox.Draw(canvas);
        }
        canvas.Restore();
    }

    Click(clickPosition : Point, action : Function) : void {
        for (const choiceBox of this.choiceBoxes) {
            const boundingRect = choiceBox.BoundingRect;
            boundingRect.Position = boundingRect.Position.Add(this.translation);
            if (clickPosition.IsInRect(boundingRect)) {
                action(choiceBox.Id);
                break;
            }
        }
    }
}