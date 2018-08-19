import { Screen } from "./screen";
import { Canvas } from "../canvas";
import { Point } from "../point";

export interface TextBoxConfiguration {
    OuterMargin : Point
    InnerMargin : Point
    Height : number
    FontSize? : number
}

const defaultTextBoxConfiguration : TextBoxConfiguration = {
    OuterMargin : new Point(0), InnerMargin : new Point(0), Height : 0, // These are never used
    FontSize : 24
}

const REWRAP_THIS_LINE = "<[{REWRAP_THIS_LINE}]>"

class TextBox {
    private position : Point;
    private size : Point;
    private innerMargin : Point;
    private innerSize : Point;

    private fontSize : number;

    private textLines : [string] = [""];
    private nextWord : string;

    constructor(position : Point, size : Point, configuration : TextBoxConfiguration) {
        this.position = position;
        this.size = size;
        this.innerMargin = configuration.InnerMargin;
        this.innerSize = this.size.Sub(this.innerMargin.Mult(new Point(2)));

        this.fontSize = configuration.FontSize || defaultTextBoxConfiguration.FontSize;
    }

    get Text() : string {
        return this.textLines.join(" ");
    }

    set Text(text : string) {
        let _text = this.Text;
        if (text.indexOf(_text) == 0) {
            let slice = text.slice(_text.length);
            this.textLines[this.textLines.length - 1] += slice;
            if (slice.length > 1) {
                this.nextWord = REWRAP_THIS_LINE;
            }
        } else {
            this.textLines = [text];
        }
    }

    set NextWord(nextWord : string) {
        this.nextWord = nextWord;
    }

    private doTheWrap(canvas : Canvas) : void {
        const comp = (line : string) => canvas.MeasureTextWidth(line) > this.innerSize.X;

        let lastLine = this.textLines[this.textLines.length - 1];

        if (this.nextWord == REWRAP_THIS_LINE) {
            // Need to wrap the fuck out of this line
            while (comp(lastLine)) {
                // Get to the char where we're outside the boudaries
                let n = 0;
                while (!comp(lastLine.slice(0, n))) { ++n; }
                // Get the previous space
                while (lastLine[n] != " " && n >= 0) { --n; }
                if (n == 0) { break; } // We can't wrap more
                // Append, update last line, and back in the loop
                this.textLines.push(lastLine.slice(n + 1)); // +1 because we don't want the space
                this.textLines[this.textLines.length - 2] = lastLine.slice(0, n);
                lastLine = this.textLines[this.textLines.length - 1];
            }
        } else {
            if (comp(lastLine + this.nextWord)) {
                this.textLines[this.textLines.length - 1] = lastLine.slice(0, lastLine.length - 1);
                this.textLines.push("");
            }
        }
    }

    Draw(canvas : Canvas) : void {
        canvas.Translate(this.position);

        canvas.DrawRect0(this.size, "cyan");

        canvas.Translate(this.position.Add(this.innerMargin));

        if (this.nextWord != null) {
            this.doTheWrap(canvas);
            this.nextWord = null;
        }

        for (let i = 0; i < this.textLines.length; ++i) {
            canvas.DrawText(
                this.textLines[i],
                new Point(0, i * (24 * 1.42857)),
                "black",
                this.fontSize,
                this.innerSize.X
            ); // This is the golden ratio, on line-height and font-size
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