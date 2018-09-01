import { Choice } from "inkjs";
import { Canvas } from "../canvas";
import { IRect, Point } from "../point";
import { BoxBackground, BoxBackgroundFactory, BoxBackgroundTypes } from "./boxbackgrounds";
import { GameplayLayer } from "./layers";

class ChoiceBox {
    private boxBackground : BoxBackground;
    private fontSize : number = 24;
    private hasAlreadyBeenDrawnOnce : boolean = false;
    private id : number;
    private innerMargin : Point = new Point(0, 20);
    private position : Point;
    private size : Point;
    private text : string;

    constructor(id : number, text : string, width : number, position : Point) {
        this.id = id;
        this.text = text;

        this.size = new Point(width, (this.fontSize * 1.42857) + (2 * this.innerMargin.Y));
        this.position = position;

        this.boxBackground = BoxBackgroundFactory.Create(BoxBackgroundTypes.COLOR, "rgba(0, 0, 0, .7)", this.size, this.position);
    }

    get Id() : number {
        return this.id;
    }

    get BoundingRect() : IRect {
        return {
            Position : this.position,
            Size : this.size
        };
    }

    Draw(canvas : Canvas) : void {
        if (!this.hasAlreadyBeenDrawnOnce) {
            this.beforeFirstDraw(canvas);
        }

        this.boxBackground.Draw(canvas);
        canvas.DrawText(this.text, this.position.Add(this.innerMargin), "white", this.fontSize, this.size.X);
    }

    private beforeFirstDraw(canvas : Canvas) : void {
        canvas.DrawText0("", "transparent", this.fontSize);
        this.innerMargin.X = (this.size.X - canvas.MeasureTextWidth(this.text)) / 2;
    }
}

export class ChoiceLayer extends GameplayLayer {
    boundingRect : Point;
    choiceBoxes : ChoiceBox[] = [];
    choices : Choice[] = [];
    screenSize : Point;
    translation : Point;

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

    Draw(canvas : Canvas) : void {
        canvas.Translate(this.translation);
        for (const choiceBox of this.choiceBoxes) {
            choiceBox.Draw(canvas);
        }
        canvas.Restore();
    }

    Step(delta : number) : void { }
}
