import { Screen } from "./screen";
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

    private textLines : [string] = [""];
    private nextWord : string;

    constructor(position : Point, size : Point, configuration : TextBoxConfiguration) {
        this.position = position;
        this.size = size;
        this.innerMargin = configuration.InnerMargin;
        this.innerSize = this.size.Sub(this.innerMargin.Mult(new Point(2)));
    }

    get Text() : string {
        return this.textLines.join(" ");
    }

    set Text(text : string) {
        let _text = this.Text;
        if (text.indexOf(_text) == 0) {
            let slice = text.slice(_text.length);
            if (slice.length == 1) {
                this.textLines[this.textLines.length - 1] += slice;
            }
        } else {
            this.textLines = [text];
        }
    }

    set NextWord(nextWord : string) {
        this.nextWord = nextWord;
    }

    Draw(canvas : Canvas) : void {
        canvas.Translate(this.position);

        canvas.DrawRect0(this.size, "cyan");

        canvas.Translate(this.position.Add(this.innerMargin));

        if (this.nextWord != null) {
            const lastLine = this.textLines[this.textLines.length - 1];
            if (canvas.MeasureTextWidth(lastLine + this.nextWord) > this.innerSize.X) {
                this.textLines[this.textLines.length - 1] = lastLine.slice(0, lastLine.length - 1);
                this.textLines.push("");
            }
            this.nextWord = null;
        }

        for (let i = 0; i < this.textLines.length; ++i) {
            canvas.DrawText(this.textLines[i], new Point(0, i * (24 * 1.42857)), "black", this.innerSize.X);
        }

        canvas.Restore();
    }
}

export class TextScreen extends Screen {
    private textBox : TextBox;

    // @ts-ignore
    constructor(screenSize : Point, textBoxConfiguration : TextBoxConfiguration) {
        let textBoxSize = new Point(
            screenSize.X - (textBoxConfiguration.OuterMargin.X * 2),
            textBoxConfiguration.Height
        );
        let textBoxPosition = new Point(
            textBoxConfiguration.OuterMargin.X,
            screenSize.Y - textBoxConfiguration.OuterMargin.Y - textBoxConfiguration.Height
        );
        // @ts-ignore
        this.textBox = new TextBox(textBoxPosition, textBoxSize, textBoxConfiguration);
    }

    get Text() : string {
        return this.textBox.Text;
    }

    set Text(text : string) {
        this.textBox.Text = text;
    }

    set NextWord(nextWord : string) {
        this.textBox.NextWord = nextWord;
    }

    Draw(canvas : Canvas) : void {
        this.textBox.Draw(canvas);
    }
}