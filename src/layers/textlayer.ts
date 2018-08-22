import { GameplayLayer } from "./layers";
import { Canvas } from "../canvas";
import { Point } from "../point";

export interface BoxConfiguration {
    OuterMargin : Point
    InnerMargin : Point
    Height : number
    BackgroundColor? : string
    FontSize? : number
    FontColor? : string
}

const defaultBoxConfiguration : BoxConfiguration = {
    OuterMargin : new Point(0), InnerMargin : new Point(10), Height : 0,
    BackgroundColor : "rgba(0.0, 0.0, 0.0, 0.6)",
    FontSize : 24, FontColor : "white"
}

const REWRAP_THIS_LINE = "<[{REWRAP_THIS_LINE}]>"

class TextBox {
    private position : Point;
    private size : Point;
    private innerMargin : Point;
    private innerSize : Point;

    private backgroundColor : string;

    private fontSize : number;
    private fontColor : string;

    private textLines : [string] = [""];
    private nextWord : string;

    constructor(position : Point, size : Point, configuration : BoxConfiguration) {
        this.position = position.Clone();
        this.size = size.Clone();
        this.innerMargin = configuration.InnerMargin;
        this.innerSize = this.size.Sub(this.innerMargin.Mult(new Point(2)));

        this.backgroundColor = configuration.BackgroundColor || defaultBoxConfiguration.BackgroundColor;

        this.fontSize = configuration.FontSize || defaultBoxConfiguration.FontSize;
        this.fontColor = configuration.FontColor || defaultBoxConfiguration.FontColor;
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
        canvas.DrawText0("", "transparent", this.fontSize);
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

        canvas.DrawRect0(this.size, this.backgroundColor);

        canvas.Translate(this.position.Add(this.innerMargin));

        if (this.nextWord != null) {
            this.doTheWrap(canvas);
            this.nextWord = null;
        }

        for (let i = 0; i < this.textLines.length; ++i) {
            canvas.DrawText(
                this.textLines[i],
                new Point(0, i * (this.fontSize * 1.42857)), // This is the golden ratio, on line-height and font-size
                this.fontColor,
                this.fontSize,
                this.innerSize.X
            );
        }

        canvas.Restore();
    }
}

class NameBox {
    private name : string;

    private position : Point;
    private size : Point;
    private innerMargin : Point;

    private fontSize : number;
    private fontColor : string;

    private backgroundColor : string;

    constructor(position : Point, configuration : BoxConfiguration);
    constructor(position : Point, configuration : BoxConfiguration, name? : string) {
        this.size = configuration.InnerMargin.Mult(new Point(2.0));
        this.position = position.Clone();
        this.position.Y -= this.size.Y;

        this.innerMargin = configuration.InnerMargin.Clone();

        this.fontSize = configuration.FontSize || defaultBoxConfiguration.FontSize;
        this.fontColor = configuration.FontColor || defaultBoxConfiguration.FontColor;

        this.backgroundColor = configuration.BackgroundColor || defaultBoxConfiguration.BackgroundColor;
    }

    set Name(name : string) {
        if (name != this.name) {
            this.name = name;
            this.position.Y += this.size.Y;
            this.size.X = 0;
            this.size.Y = 0;
        }
    }

    Draw(canvas : Canvas) : void {
        if (this.name.length > 0) {
            if (this.size.X == 0 && this.size.Y == 0) {
                canvas.DrawText0("", "transparent", this.fontSize);
                // Must compute the size
                this.size.X = canvas.MeasureTextWidth(this.name);
                this.size.Y = this.fontSize * 1.42857;
                this.size = this.size.Add(this.innerMargin.Mult(new Point(2.0)));
                this.position.Y -= this.size.Y;
            }

            canvas.Translate(this.position);
            canvas.DrawRect0(this.size, this.backgroundColor);
            canvas.DrawText(this.name, this.innerMargin, this.fontColor, this.fontSize, this.size.X);
            canvas.Restore();
        }
    }
}

export class TextLayer extends GameplayLayer {
    private textBox : TextBox;
    private nameBox : NameBox;

    constructor(screenSize : Point, textBoxConfiguration : BoxConfiguration) {
        super()

        let textBoxSize = new Point(
            screenSize.X - (textBoxConfiguration.OuterMargin.X * 2),
            textBoxConfiguration.Height
        );
        let textBoxPosition = new Point(
            textBoxConfiguration.OuterMargin.X,
            screenSize.Y - textBoxConfiguration.OuterMargin.Y - textBoxConfiguration.Height
        );
        this.textBox = new TextBox(textBoxPosition, textBoxSize, textBoxConfiguration);
    
        this.nameBox = new NameBox(
            textBoxPosition.Add(new Point(defaultBoxConfiguration.InnerMargin.X, 0.0)),
            defaultBoxConfiguration
        );
    }

    get Text() : string {
        return this.textBox.Text;
    }

    set Text(text : string) {
        this.textBox.Text = text;
    }

    set Name(name : string) {
        this.nameBox.Name = name;
    }

    set NextWord(nextWord : string) {
        this.textBox.NextWord = nextWord;
    }

    Step(delta : number) : void {
    }

    Draw(canvas : Canvas) : void {
        this.textBox.Draw(canvas);
        this.nameBox.Draw(canvas);
    }

    Click(clickPosition : Point, action : Function) : void {
        
    }
}