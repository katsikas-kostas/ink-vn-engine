import { Canvas } from "../canvas";
import { Point } from "../point";

export interface TextBoxConfiguration {
    OuterMargin : Point
    InnerMargin : Point
    Height : number
}

class TextBox {
    private position : Point;
    private size : Point;
    private innerMargin : Point;
    private innerSize : Point;

    private text : string = "";

    constructor(position : Point, size : Point, configuration : TextBoxConfiguration) {
        this.position = position;
        this.size = size;
        this.innerMargin = configuration.InnerMargin;
        this.innerSize = this.size.Sub(this.innerMargin.Mult(new Point(2)));
    }

    get Text() : string {
        return this.text;
    }

    set Text(text : string) {
        this.text = text;
    }

    Draw(canvas : Canvas) : void {
        canvas.Translate(this.position);
        canvas.DrawRect0(this.size, "cyan");
        canvas.DrawText(this.text, this.innerMargin, "black", this.innerSize.X);
        canvas.Restore();
    }
}

export class TextScreen extends Screen {
    private textBox : TextBox;

    constructor(screenSize : Point, textBoxConfiguration : TextBoxConfiguration) {
        let textBoxSize = new Point(
            screenSize.X - (textBoxConfiguration.OuterMargin.X * 2),
            textBoxConfiguration.Height
        );
        let textBoxPosition = new Point(
            textBoxConfiguration.OuterMargin.X,
            screenSize.Y - textBoxConfiguration.OuterMargin.Y - textBoxConfiguration.Height
        );
        this.textBox = new TextBox(textBoxPosition, textBoxSize, textBoxConfiguration);
    }

    get Text() : string {
        return this.textBox.Text;
    }

    set Text(text : string) {
        this.textBox.Text = text;
    }

    Draw(canvas : Canvas) : void {
        this.textBox.Draw(canvas);
    }
}